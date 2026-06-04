"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, SignOutIcon } from "@phosphor-icons/react";
import Navbar from "@/components/Navbar";
import { signOut } from "@/lib/auth";
import { getLocalUserEmail, getLocalUserId } from "@/lib/userSession";

export default function SettingsPage() {
  const router = useRouter();
  const userId = getLocalUserId();
  const email = getLocalUserEmail();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/signin");
    } catch {
      setIsSigningOut(false);
    }
  }

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
            <h2 className="text-sm font-semibold text-neutral-800 mb-4">Account</h2>
            <dl className="text-sm space-y-3">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Email</dt>
                <dd className="font-medium text-neutral-800">{email ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Signed in</dt>
                <dd className="font-medium text-neutral-800">
                  {userId ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
            {!userId && (
              <Link
                href="/signin"
                className="inline-block mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Sign in
              </Link>
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
            <p className="text-xs text-neutral-500 mt-2">
              Clears your local user id and Supabase session.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
