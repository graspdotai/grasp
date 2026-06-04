import { z } from "zod";

export const onboardingProfileSchema = z.object({
  personas: z.array(z.string()).max(5),
  interests: z.array(z.string()),
  language: z.string(),
  lessonLength: z.string(),
});

export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;

export const ONBOARDING_STORAGE_KEY = "grasp_onboarding_profile";

export function formatOnboardingForPrompt(profile: OnboardingProfile): string {
  const lines: string[] = [];

  if (profile.personas.length > 0) {
    lines.push(`Learner personas: ${profile.personas.join(", ")}`);
  }
  if (profile.interests.length > 0) {
    lines.push(`Learning interests: ${profile.interests.join(", ")}`);
  }
  lines.push(`Preferred lesson language: ${profile.language}`);
  lines.push(`Preferred module length: ${profile.lessonLength}`);

  return lines.join("\n");
}
