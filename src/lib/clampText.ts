/** Truncate copy for UI / DB caps without breaking mid-word when possible. */
export function clampText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;

  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;

  return `${base.trimEnd()}…`;
}

export const COURSE_SUMMARY_MAX = 220;
export const MODULE_DESCRIPTION_MAX = 160;
