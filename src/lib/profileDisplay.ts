/** Human-readable label for navbar / profile */
export function resolveDisplayName(input: {
  fullName?: string | null;
  email?: string | null;
}): string {
  const trimmed = input.fullName?.trim();
  if (trimmed) return trimmed;

  const email = input.email?.trim();
  if (email) {
    const local = email.split("@")[0] ?? "";
    if (local) {
      return local
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  return "Grasp learner";
}

export function extractFullNameFromMetadata(
  metadata: Record<string, unknown> | undefined,
): string | null {
  if (!metadata) return null;

  const candidates = [
    metadata.full_name,
    metadata.fullName,
    metadata.name,
    metadata.display_name,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}
