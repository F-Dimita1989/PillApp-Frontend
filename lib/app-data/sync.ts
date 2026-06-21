import type { TherapyDayKey, TherapyDayPlan } from "@/lib/therapy/types";
import { THERAPY_DAYS, THERAPY_DAY_TO_WEEKDAY } from "@/lib/therapy/types";
import type { TherapyPlan } from "@/lib/therapy/plan-storage";
import type { DoseEvent, DoseStatus, Medication } from "@/types/domain";
import { mapUnitaToMedicationForm } from "@/lib/farmaci/form-values";

const THERAPY_DAY_KEYS = THERAPY_DAYS as readonly TherapyDayKey[];

export function therapyDayPlanToDaysActive(dayPlan: TherapyDayPlan): boolean[] {
  const daysActive = [false, false, false, false, false, false, false];
  for (const day of THERAPY_DAY_KEYS) {
    if (dayPlan[day]) {
      const weekday = THERAPY_DAY_TO_WEEKDAY[day];
      daysActive[weekday - 1] = true;
    }
  }
  return daysActive;
}

export function isTherapyDayActiveToday(dayPlan: TherapyDayPlan): boolean {
  const today = new Date().getDay();
  const weekday = today + 1;
  for (const day of THERAPY_DAY_KEYS) {
    if (THERAPY_DAY_TO_WEEKDAY[day] === weekday && dayPlan[day]) {
      return true;
    }
  }
  return false;
}

export function medicationFromTherapyPlan(plan: TherapyPlan): Medication {
  return {
    id: `med-therapy-${plan.aic || plan.farmacoNome}`,
    name: plan.farmacoNome,
    aic: plan.aic || undefined,
    form: mapUnitaToMedicationForm(plan.unitaQuantita),
    dose: plan.dose,
    schedule: {
      times: plan.orari.length ? plan.orari : [plan.orario],
      daysActive: therapyDayPlanToDaysActive(plan.dayPlan),
    },
    notes: plan.note || undefined,
    quantityRemaining: plan.quantita.trim() || undefined,
    quantityUnit: plan.unitaQuantita,
    active: true,
    createdAt: plan.updatedAt,
    source: plan.aic ? "aic_scan" : "manual",
  };
}

export function buildDosesForToday(medications: Medication[]): DoseEvent[] {
  const today = new Date().toISOString().slice(0, 10);
  const weekday = new Date().getDay() + 1;
  const doses: DoseEvent[] = [];

  for (const med of medications) {
    if (!med.active) continue;

    const dayIndex = weekday - 1;
    if (!med.schedule.daysActive[dayIndex]) continue;

    for (const time of med.schedule.times) {
      doses.push({
        id: `dose-${med.id}-${time}`,
        medicationId: med.id,
        medicationName: med.name,
        scheduledTime: time,
        date: today,
        status: inferInitialStatus(time),
        dose: med.dose,
      });
    }
  }

  return doses.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

function inferInitialStatus(scheduledTime: string): DoseStatus {
  const match = scheduledTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "pending";

  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(Number(match[1]), Number(match[2]), 0, 0);
  const diffMin = (scheduled.getTime() - now.getTime()) / 60000;

  if (diffMin < -30) return "overdue";
  if (diffMin <= 30) return "due_soon";
  return "pending";
}

export function mergeMedicationsWithTherapy(
  stored: Medication[],
  therapyMed: Medication | null,
): Medication[] {
  if (!therapyMed) return stored;

  const withoutDuplicate = stored.filter(
    (m) => m.id !== therapyMed.id && m.aic !== therapyMed.aic,
  );
  return [therapyMed, ...withoutDuplicate];
}
