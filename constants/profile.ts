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
    description: "Per un saluto più personalizzato",
  },
  {
    value: "male",
    label: "Uomo",
    description: "Per un saluto più personalizzato",
  },
  {
    value: "prefer_not_to_say",
    label: "Preferisco non dirlo",
    description: "Va benissimo così",
  },
];

export const MIN_GUEST_AGE = 1;
export const MAX_GUEST_AGE = 120;
