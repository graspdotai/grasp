"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { resolveDisplayName } from "@/lib/profileDisplay";
import { resolveAvatarVariant } from "@/lib/avatar";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  GraduationCapIcon,
  LightbulbIcon,
  BrainIcon,
  NotebookIcon,
  BookmarkIcon,
  StarIcon,
  PencilSimpleIcon,
  MagnifyingGlassIcon,
  FlaskIcon,
  ClockIcon,
  TrophyIcon,
  TranslateIcon,
  PaletteIcon,
} from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import { loadOnboardingProfile } from "@/lib/onboardingStorage";
import { getLocalUserEmail, getLocalUserId } from "@/lib/userSession";
import { useProfile } from "@/hooks/useProfile";
import type { OnboardingProfile } from "@/lib/onboarding";

function ProfileRow({
  icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        {icon}
      </div>
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p
          className={`text-sm font-medium text-neutral-800 mt-0.5 ${capitalize ? "capitalize" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

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

        <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden max-w-3xl mx-auto">
          {/* Header with decorative ghost icons */}
          <div className="relative px-6 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6 overflow-hidden">
            {/* Far top-left corner — peeking in for balance */}
            <BookOpenIcon
              size={64}
              weight="light"
              className="pointer-events-none select-none absolute -top-3 -left-4 rotate-[-16deg] text-neutral-400 opacity-[0.15]"
            />

            {/* Right cluster — two columns, spread vertically */}
            {/* Far-right column */}
            <GraduationCapIcon
              size={72}
              weight="light"
              className="pointer-events-none select-none absolute -top-2 right-3  rotate-12      text-neutral-400 opacity-[0.20]"
            />
            <LightbulbIcon
              size={64}
              weight="light"
              className="pointer-events-none select-none absolute -bottom-2 right-2 rotate-[-8deg] text-neutral-400 opacity-[0.18]"
            />

            {/* Mid-right column */}
            <BrainIcon
              size={56}
              weight="light"
              className="pointer-events-none select-none absolute top-0 right-24 -rotate-12     text-neutral-400 opacity-[0.17]"
            />
            <NotebookIcon
              size={52}
              weight="light"
              className="pointer-events-none select-none absolute bottom-0 right-20 rotate-16    text-neutral-400 opacity-[0.16]"
            />

            {/* Bridge between columns */}
            <BookmarkIcon
              size={44}
              weight="light"
              className="pointer-events-none select-none absolute top-1/2 -translate-y-1/2 right-12 rotate-22 text-neutral-400 opacity-[0.14]"
            />

            {/* Extra fill — spread across the right half */}
            <StarIcon
              size={38}
              weight="light"
              className="pointer-events-none select-none absolute top-2 right-36 rotate-18 text-neutral-400 opacity-[0.14]"
            />
            <TrophyIcon
              size={48}
              weight="light"
              className="pointer-events-none select-none absolute bottom-1 right-36 rotate-[-14deg] text-neutral-400 opacity-[0.15]"
            />
            <MagnifyingGlassIcon
              size={42}
              weight="light"
              className="pointer-events-none select-none absolute top-0 right-48 rotate-10 text-neutral-400 opacity-[0.13]"
            />
            <FlaskIcon
              size={40}
              weight="light"
              className="pointer-events-none select-none absolute bottom-0 right-52 rotate-[-18deg] text-neutral-400 opacity-[0.13]"
            />
            <PencilSimpleIcon
              size={44}
              weight="light"
              className="pointer-events-none select-none absolute top-1/2 -translate-y-1/2 right-44 rotate-24 text-neutral-400 opacity-[0.12]"
            />
            <ClockIcon
              size={40}
              weight="light"
              className="pointer-events-none select-none absolute top-3 right-60 rotate-[-8deg] text-neutral-400 opacity-[0.12]"
            />

            <div className="relative gap-6 flex flex-col">
              <UserAvatar profile={profile} email={email} size={56} />
              <div>
                <h1 className="text-2xl font-bold tracking-tight leading-tight">
                  {displayName}
                </h1>
                <p className="text-sm text-neutral-500 font-medium">{email}</p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            {!userId && (
              <p className="mt-6 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
                Sign in to sync your profile across devices.
              </p>
            )}

            {isLoading && userId && (
              <p className="mt-6 text-sm text-neutral-500">Loading profile…</p>
            )}

            {!isLoading && profile && (
              <div className="mt-6 flex flex-col gap-1">
                <ProfileRow
                  icon={<PaletteIcon size={20} weight="regular" />}
                  label="Avatar style"
                  value={resolveAvatarVariant(profile)}
                />
                {profile.learner_types?.length > 0 && (
                  <ProfileRow
                    icon={<BrainIcon size={20} weight="regular" />}
                    label="Learner type"
                    value={profile.learner_types.join(", ")}
                  />
                )}
                {profile.learning_interests?.length > 0 && (
                  <ProfileRow
                    icon={<StarIcon size={20} weight="regular" />}
                    label="Interests"
                    value={profile.learning_interests.join(", ")}
                  />
                )}
                {profile.lesson_language && (
                  <ProfileRow
                    icon={<TranslateIcon size={20} weight="regular" />}
                    label="Lesson language"
                    value={profile.lesson_language}
                    capitalize
                  />
                )}
                {profile.lesson_length && (
                  <ProfileRow
                    icon={<ClockIcon size={20} weight="regular" />}
                    label="Preferred lesson length"
                    value={profile.lesson_length}
                    capitalize
                  />
                )}
              </div>
            )}

            {onboarding && (
              <div className="mt-8 pt-8 border-t border-neutral-100">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Local onboarding (this device)
                </h2>
                <div className="flex flex-col gap-1">
                  <ProfileRow
                    icon={<TranslateIcon size={20} weight="regular" />}
                    label="Language"
                    value={onboarding.language}
                    capitalize
                  />
                  <ProfileRow
                    icon={<ClockIcon size={20} weight="regular" />}
                    label="Lesson length"
                    value={onboarding.lessonLength}
                    capitalize
                  />
                  <ProfileRow
                    icon={<BrainIcon size={20} weight="regular" />}
                    label="Learner types"
                    value={onboarding.personas.join(", ")}
                  />
                  <ProfileRow
                    icon={<StarIcon size={20} weight="regular" />}
                    label="Interests"
                    value={onboarding.interests.join(", ")}
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Link
                href="/settings"
                className="inline-flex w-full items-center justify-center bg-primary px-4 py-4 font-medium text-white hover:bg-primary-700 transition-colors rounded-full"
              >
                Edit settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
