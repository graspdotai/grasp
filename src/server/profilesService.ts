import type { OnboardingProfile } from "@/lib/onboarding";
import { HttpError } from "@/server/errors";
import { getSupabaseAdminClient } from "@/server/supabase";

export async function upsertProfileFromOnboarding(
  userId: string,
  onboarding: OnboardingProfile,
  email?: string | null
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: email ?? null,
      onboarding_completed: true,
      learner_types: onboarding.personas,
      learning_interests: onboarding.interests,
      lesson_language: onboarding.language,
      lesson_length: onboarding.lessonLength,
      updated_at: now,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new HttpError(500, "PROFILE_UPSERT_FAILED", error.message);
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
