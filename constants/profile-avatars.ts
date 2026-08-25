import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type ProfileAvatarId =
  | "heart"
  | "flower"
  | "sun"
  | "leaf"
  | "paw"
  | "star"
  | "anchor"
  | "smile";

export type ProfileAvatarOption = {
  id: ProfileAvatarId;
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
};

export const PROFILE_AVATARS: ProfileAvatarOption[] = [
  { id: "heart", label: "Cuore", icon: "heart" },
  { id: "smile", label: "Sorriso", icon: "emoticon-happy" },
  { id: "flower", label: "Fiore", icon: "flower" },
  { id: "sun", label: "Sole", icon: "white-balance-sunny" },
  { id: "leaf", label: "Foglia", icon: "leaf" },
  { id: "paw", label: "Zampa", icon: "paw" },
  { id: "star", label: "Stella", icon: "star" },
  { id: "anchor", label: "Ancora", icon: "anchor" },
];

export const DEFAULT_PROFILE_AVATAR_ID: ProfileAvatarId = "heart";

export function getProfileAvatar(id: string | undefined): ProfileAvatarOption {
  return PROFILE_AVATARS.find((avatar) => avatar.id === id) ?? PROFILE_AVATARS[0];
}
