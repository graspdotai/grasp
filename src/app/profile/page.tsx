"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { resolveDisplayName } from "@/lib/profileDisplay";
import { resolveAvatarVariant } from "@/lib/avatar";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import { loadOnboardingProfile } from "@/lib/onboardingStorage";
import { getLocalUserEmail, getLocalUserId } from "@/lib/userSession";
import { useProfile } from "@/hooks/useProfile";
import type { OnboardingProfile } from "@/lib/onboarding";

export default function ProfilePage() {
  const userId = getLocalUserId();
  const { data: profile, isLoading } = useProfile();
  const [onboarding, setOnboarding] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    setOnboarding(loadOnboardingProfile());
  }, []);

  const email = profile?.email ?? getLocalUserEmail() ?? "Not signed in";
  const displayName = resolveDisplayName({
    fullName: profile?.full_name,
    email,
  });

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="p-6 max-w-7xl mx-auto">
        <Navbar />

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 mt-6 mb-8"
        >
          <ArrowLeftIcon size={14} weight="bold" />
          Back to Courses
        </Link>

        <div className="bg-white rounded-3xl border border-neutral-100 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <UserAvatar profile={profile} email={email} size={56} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
              <p className="text-sm text-neutral-500 mt-0.5">{email}</p>
              {userId && (
                <p className="text-[10px] text-neutral-400 mt-2 font-mono truncate max-w-xs">
                  {userId}
                </p>
              )}
            </div>
          </div>

          {!userId && (
            <p className="mt-6 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
              Sign in to sync your profile across devices.
            </p>
          )}

          {isLoading && userId && (
            <p className="mt-6 text-sm text-neutral-500">Loading profile…</p>
          )}

          {!isLoading && profile && (
            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Avatar
                </h2>
                <p className="text-sm text-neutral-700">
                  {resolveAvatarVariant(profile)}
                </p>
              </div>

              {profile.learner_types?.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Learner type
                  </h2>
                  <p className="text-sm text-neutral-700">
                    {profile.learner_types.join(", ")}
                  </p>
                </div>
              )}

              {profile.learning_interests?.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Interests
                  </h2>
                  <p className="text-sm text-neutral-700">
                    {profile.learning_interests.join(", ")}
                  </p>
                </div>
              )}

              {profile.lesson_language && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Lesson language
                  </h2>
                  <p className="text-sm text-neutral-700 capitalize">
                    {profile.lesson_language}
                  </p>
                </div>
              )}

              {profile.lesson_length && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    Preferred lesson length
                  </h2>
                  <p className="text-sm text-neutral-700 capitalize">
                    {profile.lesson_length}
                  </p>
                </div>
              )}
            </div>
          )}

          {onboarding && (
            <div className="mt-8 pt-8 border-t border-neutral-100">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Local onboarding (this device)
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-neutral-500">Language</dt>
                  <dd className="font-medium capitalize">{onboarding.language}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Lesson length</dt>
                  <dd className="font-medium capitalize">{onboarding.lessonLength}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Learner types</dt>
                  <dd className="font-medium">{onboarding.personas.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Interests</dt>
                  <dd className="font-medium">{onboarding.interests.join(", ")}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Edit settings
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
