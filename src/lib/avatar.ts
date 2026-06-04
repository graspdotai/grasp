/** Boring Avatars variants — matches boring-avatars AVATAR_VARIANTS keys */
export const AVATAR_VARIANTS = [
  "marble",
  "beam",
  "pixel",
  "sunset",
  "ring",
  "bauhaus",
  "geometric",
  "abstract",
] as const;

export type AvatarVariant = (typeof AVATAR_VARIANTS)[number];

export const DEFAULT_AVATAR_VARIANT: AvatarVariant = "marble";

export const AVATAR_VARIANT_LABELS: Record<AvatarVariant, string> = {
  marble: "Marble",
  beam: "Beam",
  pixel: "Pixel",
  sunset: "Sunset",
  ring: "Ring",
  bauhaus: "Bauhaus",
  geometric: "Geometric",
  abstract: "Abstract",
};

export function isAvatarVariant(value: string): value is AvatarVariant {
  return (AVATAR_VARIANTS as readonly string[]).includes(value);
}

export function parseAvatarVariant(
  value: string | null | undefined,
): AvatarVariant {
  if (!value) return DEFAULT_AVATAR_VARIANT;
  const normalized = value.trim().toLowerCase();
  if (isAvatarVariant(normalized)) return normalized;
  return DEFAULT_AVATAR_VARIANT;
}

/** Prefer dedicated column; fall back to legacy avatar_url when it stores a variant id. */
export function resolveAvatarVariant(profile: {
  avatar_variant?: string | null;
  avatar_url?: string | null;
}): AvatarVariant {
  if (profile.avatar_variant) {
    return parseAvatarVariant(profile.avatar_variant);
  }
  const url = profile.avatar_url?.trim();
  if (url && !url.startsWith("http")) {
    return parseAvatarVariant(url);
  }
  return DEFAULT_AVATAR_VARIANT;
}
