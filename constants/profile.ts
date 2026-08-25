export const GUEST_PROFILE_KEY = "pillapp:guestProfile";

export type GuestSex = "female" | "male" | "prefer_not_to_say";

export const GUEST_SEX_OPTIONS: {
  value: GuestSex;
  label: string;
  description: string;
}[] = [
  {
    value: "female",
    label: "Donna",
    description: "Adatto i messaggi al femminile",
  },
  {
    value: "male",
    label: "Uomo",
    description: "Adatto i messaggi al maschile",
  },
  {
    value: "prefer_not_to_say",
    label: "Preferisco non dirlo",
    description: "Nessun problema, continuiamo lo stesso",
  },
];

export const MIN_GUEST_AGE = 1;
export const MAX_GUEST_AGE = 120;

export const GUEST_AGE_OPTIONS = Array.from(
  { length: MAX_GUEST_AGE - MIN_GUEST_AGE + 1 },
  (_, index) => {
    const age = MIN_GUEST_AGE + index;
    return { value: String(age), label: `${age} anni` };
  }
);
