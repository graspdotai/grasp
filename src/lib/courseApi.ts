import type { OnboardingProfile } from "@/lib/onboarding";

export interface Slide {
  title: string;
  points: string[];
  explanationText: string;
}

export interface CourseSection {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  description: string;
  keyPoints: string[];
  slides: Slide[];
}

export interface CoursePayload {
  course: {
    id: string;
    userId: string | null;
    title: string;
    goal: string;
    summary: string;
    learnerLevel: string;
    status: string;
    progressPercent: number;
    createdAt: string;
    onboarding: OnboardingProfile | null;
  };
  sections: CourseSection[];
  sources: Array<{ title: string; url: string }>;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function fetchCourse(sessionId: string): Promise<CoursePayload> {
  const res = await fetch(`/api/sessions/${sessionId}/course`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to load course");
  }

  return res.json();
}

export async function createCourse(input: {
  topic: string;
  goal: string;
  learnerLevel: "beginner" | "intermediate" | "advanced";
  onboarding?: OnboardingProfile;
  userId?: string;
}): Promise<CoursePayload> {
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, type: "deep" }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create course");
  }

  return res.json();
}

export async function updateModuleProgress(
  sessionId: string,
  moduleId: string,
  completed: boolean
): Promise<{ progressPercent: number }> {
  const res = await fetch(`/api/sessions/${sessionId}/modules/${moduleId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to save progress");
  }

  return res.json();
}

export interface UserCourseSummary {
  id: string;
  title: string;
  goal: string;
  status: string;
  progressPercent: number;
  moduleCount: number;
  createdAt: string;
}

export async function fetchUserCourses(userId: string): Promise<UserCourseSummary[]> {
  const res = await fetch(`/api/courses?userId=${userId}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.courses ?? [];
}

export function onboardingLanguageToTts(language: string): string {
  const normalized = language.trim().toLowerCase();
  if (normalized === "english") return "english";
  if (normalized === "french") return "french";
  if (normalized === "yoruba") return "english";
  if (normalized === "igbo") return "english";
  if (normalized === "hausa") return "english";
  if (normalized === "pidgin") return "english";
  return "english";
}
