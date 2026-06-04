"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SignOutIcon } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import UserAvatar from "@/components/UserAvatar";
import {
  AVATAR_VARIANTS,
  AVATAR_VARIANT_LABELS,
  parseAvatarVariant,
  type AvatarVariant,
} from "@/lib/avatar";
import { signOut } from "@/lib/auth";
import { resolveDisplayName } from "@/lib/profileDisplay";
import { getLocalUserEmail, getLocalUserId } from "@/lib/userSession";
import type { ProfileRow } from "@/types/database";

export default function SettingsPage() {
  const router = useRouter();
  const userId = getLocalUserId();
  const email = getLocalUserEmail();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarVariant, setAvatarVariant] = useState<AvatarVariant>("marble");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    fetch(`/api/profile?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const row = data.profile as ProfileRow | null;
        setProfile(row);
        setFullName(row?.full_name ?? "");
        setAvatarVariant(parseAvatarVariant(row?.avatar_variant ?? row?.avatar_url));
      })
      .finally(() => setIsLoading(false));
  }, [userId]);

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setSaveMessage(null);

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

      setProfile(data.profile);
      setSaveMessage("Saved");
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Could not save");
    } finally {
      setIsSaving(false);
    }
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

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Manage your account and learning preferences.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <section className="bg-white rounded-3xl border border-neutral-100 p-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">Profile</h2>

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
                <div className="flex items-center gap-4">
                  <UserAvatar profile={previewProfile} size={56} variant={avatarVariant} />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{displayName}</p>
                    <p className="text-xs text-neutral-500">{email}</p>
                  </div>
                </div>

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
                  {saveMessage && (
                    <span
                      className={`text-sm ${saveMessage === "Saved" ? "text-green-600" : "text-red-600"}`}
                    >
                      {saveMessage}
                    </span>
                  )}
                </div>
              </form>
            )}
          </section>

          <section className="bg-white rounded-3xl border border-neutral-100 p-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">Learning</h2>
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
                  View profile
                </Link>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl border border-neutral-100 p-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">Session</h2>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
            >
              <SignOutIcon size={18} />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
