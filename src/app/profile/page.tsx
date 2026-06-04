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
import type { OnboardingProfile } from "@/lib/onboarding";

type ProfileRow = {
  full_name: string | null;
  email: string | null;
  avatar_variant: string | null;
  avatar_url: string | null;
  learner_types: string[];
  learning_interests: string[];
  lesson_language: string | null;
  lesson_length: string | null;
  onboarding_completed: boolean;
};

export default function ProfilePage() {
  const userId = getLocalUserId();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setOnboarding(loadOnboardingProfile());

    if (!userId) {
      setIsLoading(false);
      return;
    }

    fetch(`/api/profile?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setProfile(data.profile ?? null))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const email = profile?.email ?? getLocalUserEmail() ?? "Not signed in";
  const displayName = resolveDisplayName({
    fullName: profile?.full_name,
    email,
  });

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-5 py-5 sm:px-8 sm:py-6">
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
              <Link href="/signin" className="font-semibold underline">
                Sign in
              </Link>{" "}
              to link courses and progress to your account.
            </p>
          )}

          {isLoading ? (
            <p className="mt-8 text-sm text-neutral-500">Loading profile…</p>
          ) : (
            <div className="mt-8 grid gap-6">
              <section>
                <h2 className="text-sm font-semibold text-neutral-800 mb-3">
                  Learning preferences
                </h2>
                <dl className="grid gap-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
                    <dt className="text-neutral-500">Language</dt>
                    <dd className="font-medium text-neutral-800">
                      {profile?.lesson_language ?? onboarding?.language ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-neutral-100 pb-2">
                    <dt className="text-neutral-500">Lesson length</dt>
                    <dd className="font-medium text-neutral-800">
                      {profile?.lesson_length ?? onboarding?.lessonLength ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-500">Onboarding</dt>
                    <dd className="font-medium text-neutral-800">
                      {profile?.onboarding_completed || onboarding
                        ? "Completed"
                        : "Not completed"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-neutral-800 mb-3">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {(profile?.learning_interests?.length
                    ? profile.learning_interests
                    : onboarding?.interests ?? []
                  ).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                    >
                      {item}
                    </span>
                  ))}
                  {!profile?.learning_interests?.length && !onboarding?.interests?.length && (
                    <span className="text-sm text-neutral-500">No interests saved yet.</span>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-neutral-800 mb-3">Learner type</h2>
                <div className="flex flex-wrap gap-2">
                  {(profile?.learner_types?.length
                    ? profile.learner_types
                    : onboarding?.personas ?? []
                  ).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link href="/settings" className="font-semibold text-primary hover:underline">
              Edit name & avatar
            </Link>
            <Link href="/onboarding" className="font-semibold text-primary hover:underline">
              Update onboarding
            </Link>
          </div>
          {profile?.avatar_variant && (
            <p className="text-xs text-neutral-400 mt-2">
              Avatar style: {resolveAvatarVariant(profile)}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
