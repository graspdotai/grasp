import {
  type OnboardingProfile,
  ONBOARDING_STORAGE_KEY,
  onboardingProfileSchema,
} from "@/lib/onboarding";

export function saveOnboardingProfile(profile: OnboardingProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(profile));
}

export function loadOnboardingProfile(): OnboardingProfile | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = onboardingProfileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearOnboardingProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

