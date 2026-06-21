import type { Href } from "expo-router";

/** Route tipizzate PillApp — aggiornare se cambiano i path Expo Router */
export const AppRoutes = {
  home: "/" as Href,
  medications: "/medications" as Href,
  medicationDetails: (id: string) => `/medications/${id}` as Href,
  scan: "/scan" as Href,
  journal: "/journal" as Href,
  profile: "/profile" as Href,
  therapyLegacy: "/explore" as Href,
};
