"use client";

import { createClient } from "@/lib/supabase/client";
import type { AuthResponse, OnboardingDetails } from "@/lib/auth/types";

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
): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        ok: false,
        message: error.message.toLowerCase().includes("rate limit")
          ? "We could not create your account right now. Please try again shortly."
          : error.message,
      };
    }

    if (!data.session) {
      return {
        ok: false,
        message:
          "Email confirmation is still enabled in Supabase. Disable it to let users continue immediately.",
      };
    }

    return { ok: true, redirectTo: "/onboarding" };
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

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
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
