import type { AvatarVariant } from "@/lib/avatar";
import { parseAvatarVariant } from "@/lib/avatar";
import type { OnboardingProfile } from "@/lib/onboarding";
import { extractFullNameFromMetadata } from "@/lib/profileDisplay";
import { HttpError } from "@/server/errors";
import { getSupabaseAdminClient } from "@/server/supabase";

export async function upsertProfileFromOnboarding(
  userId: string,
  onboarding: OnboardingProfile,
  email?: string | null,
  fullName?: string | null,
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  const row: Record<string, unknown> = {
    id: userId,
    email: email ?? null,
    onboarding_completed: true,
    learner_types: onboarding.personas,
    learning_interests: onboarding.interests,
    lesson_language: onboarding.language,
    lesson_length: onboarding.lessonLength,
    updated_at: now,
  };

  if (fullName?.trim()) {
    row.full_name = fullName.trim();
  }

  const { error } = await supabase.from("profiles").upsert(row, { onConflict: "id" });

  if (error) {
    throw new HttpError(500, "PROFILE_UPSERT_FAILED", error.message);
  }
}

export async function syncProfileFromAuthUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();
  const fullName = extractFullNameFromMetadata(user.user_metadata);

  const { data: existing } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: existing?.full_name ?? fullName,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new HttpError(500, "PROFILE_SYNC_FAILED", error.message);
  }
}

export async function updateProfileSettings(
  userId: string,
  input: { fullName?: string; avatarVariant?: AvatarVariant },
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = { updated_at: now };

  if (input.fullName !== undefined) {
    const trimmed = input.fullName.trim();
    updates.full_name = trimmed.length > 0 ? trimmed : null;
  }

  if (input.avatarVariant !== undefined) {
    updates.avatar_variant = parseAvatarVariant(input.avatarVariant);
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);

  if (error) {
    throw new HttpError(500, "PROFILE_UPDATE_FAILED", error.message);
  }
}

export async function getProfileByUserId(userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw new HttpError(500, "PROFILE_READ_FAILED", error.message);
  }

  return data;
}
