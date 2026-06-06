"use client";

import { useEffect, useState } from "react";
import { useProfile, useInvalidateProfile } from "@/hooks/useProfile";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  SignOutIcon,
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
} from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import UserAvatar from "@/components/UserAvatar";
import {
  AVATAR_VARIANTS,
  AVATAR_VARIANT_LABELS,
  parseAvatarVariant,
  type AvatarVariant,
} from "@/lib/avatar";
import { deleteAccount, signOut } from "@/lib/auth";
import { resolveDisplayName } from "@/lib/profileDisplay";
import { getLocalUserEmail, getLocalUserId } from "@/lib/userSession";
import SuccessModal from "@/components/modals/SuccessModal";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";
import SignOutModal from "@/components/modals/SignOutModal";

export default function SettingsPage() {
  const router = useRouter();
  const userId = getLocalUserId();
  const email = getLocalUserEmail();
  const { data: profile, isLoading } = useProfile();
  const invalidateProfile = useInvalidateProfile();
  const [fullName, setFullName] = useState("");
  const [avatarVariant, setAvatarVariant] = useState<AvatarVariant>("marble");
  const [formInitialized, setFormInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!profile || formInitialized) return;
    setFullName(profile.full_name ?? "");
    setAvatarVariant(parseAvatarVariant(profile.avatar_variant ?? profile.avatar_url));
    setFormInitialized(true);
  }, [profile, formInitialized]);

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fullName,
          avatarVariant,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save");
      }

      invalidateProfile();
      setShowSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    await deleteAccount();
    router.push("/signin");
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/signin");
    } catch {
      setIsSigningOut(false);
    }
  }

  const previewProfile = {
    full_name: fullName || profile?.full_name,
    email: profile?.email ?? email,
    avatar_variant: avatarVariant,
    avatar_url: profile?.avatar_url,
  };

  const displayName = resolveDisplayName({
    fullName: previewProfile.full_name,
    email: previewProfile.email,
  });

  return (
    <main className="min-h-screen bg-neutral-50 ">
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

            <BookmarkIcon
              size={44}
              weight="light"
              className="pointer-events-none select-none absolute top-1/2 -translate-y-1/2 right-12 rotate-22 text-neutral-400 opacity-[0.14]"
            />

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
              <UserAvatar profile={previewProfile} size={56} variant={avatarVariant} />
              <div>
                <h1 className="text-2xl font-bold tracking-tight leading-tight">
                  {displayName}
                </h1>
                <p className="text-sm text-neutral-500 font-medium">{email}</p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex flex-col gap-8">
            <section className="pt-6 border-t border-neutral-100">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Edit Profile</h2>

              {!userId ? (
                <p className="text-sm text-neutral-500">
                  <Link href="/signin" className="text-primary font-semibold hover:underline">
                    Sign in
                  </Link>{" "}
                  to edit your name and avatar.
                </p>
              ) : isLoading ? (
                <p className="text-sm text-neutral-500">Loading…</p>
              ) : (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                  <div>
                    <label htmlFor="fullName" className="text-xs font-medium text-neutral-600">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      maxLength={120}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="mt-1.5 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-600 mb-2">Avatar style</p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {AVATAR_VARIANTS.map((variant) => (
                        <button
                          key={variant}
                          type="button"
                          onClick={() => setAvatarVariant(variant)}
                          className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-colors ${
                            avatarVariant === variant
                              ? "border-primary bg-primary/5"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                          aria-pressed={avatarVariant === variant}
                          aria-label={AVATAR_VARIANT_LABELS[variant]}
                        >
                          <UserAvatar
                            profile={previewProfile}
                            size={32}
                            variant={variant}
                          />
                          <span className="text-[9px] font-medium text-neutral-500">
                            {AVATAR_VARIANT_LABELS[variant]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
                    >
                      {isSaving ? "Saving…" : "Save profile"}
                    </button>
                    {saveError && (
                      <span className="text-sm text-red-600">{saveError}</span>
                    )}
                  </div>
                </form>
              )}
            </section>

            <section className="pt-8 border-t border-neutral-100">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Learning Preferences</h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/onboarding"
                    className="font-medium text-primary hover:underline"
                  >
                    Redo onboarding
                  </Link>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    Update interests, language, and lesson length for new courses.
                  </p>
                </li>
                <li>
                  <Link href="/profile" className="font-medium text-primary hover:underline">
                    View profile overview
                  </Link>
                </li>
              </ul>
            </section>

            <section className="pt-8 border-t border-neutral-100">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Session & Account</h2>
              <div className="flex flex-col gap-6">
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSignOutModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    <SignOutIcon size={18} />
                    Sign out
                  </button>
                </div>
                
                {userId && (
                  <div>
                    <h3 className="text-sm font-semibold text-danger-700 mb-1">Danger Zone</h3>
                    <p className="text-sm text-neutral-500 mb-3">
                      Removes your profile, all courses, and your sign-in. This cannot be undone.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="rounded-xl bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger-700"
                    >
                      Delete my account
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <SuccessModal
        open={showSaveSuccess}
        onClose={() => setShowSaveSuccess(false)}
        title="Profile saved"
        description="Your name and avatar have been updated."
      />

      <SignOutModal
        open={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        isLoading={isSigningOut}
      />

      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteAccount}
      />
    </main>
  );
}
