"use client";

import { createClient } from "@/lib/supabase/client";
import type { AuthResponse, OnboardingDetails } from "@/lib/auth/types";
import { extractFullNameFromMetadata } from "@/lib/profileDisplay";
import { setLocalUserEmail, setLocalUserId } from "@/lib/userSession";

async function persistLocalUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    setLocalUserId(user.id);
    if (user.email) setLocalUserEmail(user.email);

    const fullName = extractFullNameFromMetadata(
      user.user_metadata as Record<string, unknown>,
    );
    const now = new Date().toISOString();

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        ...(fullName ? { full_name: fullName } : {}),
        updated_at: now,
      },
      { onConflict: "id" },
    );
  }
}

function appUrl(path: string) {
  return `${window.location.origin}${path}`;
}

function authCallbackUrl(nextPath: string) {
  return appUrl(`/auth/callback?next=${encodeURIComponent(nextPath)}`);
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
): Promise<AuthResponse> {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        ...(fullName?.trim() ? { fullName: fullName.trim() } : {}),
      }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok || !body.ok) {
      return {
        ok: false,
        message:
          typeof body.message === "string"
            ? body.message
            : "We could not create your account right now. Please try again.",
      };
    }

    if (body.user?.id) {
      setLocalUserId(body.user.id);
      if (body.user.email) setLocalUserEmail(body.user.email);
    }

    return { ok: true, redirectTo: body.redirectTo ?? "/onboarding" };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    await persistLocalUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .single();

    return {
      ok: true,
      redirectTo: profile?.onboarding_completed ? "/" : "/onboarding",
    };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}

export async function signInWithGoogle(
  redirectPath = "/onboarding",
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: authCallbackUrl(redirectPath),
      },
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}

export async function saveOnboardingDetails(
  details: OnboardingDetails,
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return { ok: false, message: userError.message };
    }

    if (!user) {
      return {
        ok: false,
        message: "Please sign in before finishing onboarding.",
      };
    }

    const fullName = extractFullNameFromMetadata(
      user.user_metadata as Record<string, unknown>,
    );

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        ...(fullName ? { full_name: fullName } : {}),
        onboarding_completed: true,
        learner_types: details.learnerTypes,
        learning_interests: details.learningInterests,
        lesson_language: details.lessonLanguage,
        lesson_length: details.lessonLength,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}
