"use client";

import Link from "next/link";
import { useState } from "react";
import LogoIcon from "@/components/Logo";
import { GoogleIcon, VisibilityIcon } from "@/components/auth/icons";
import { signInWithGoogle, signUpWithEmail } from "@/lib/auth/client";
import Spinner from "@/components/Spinner";
import { toast } from "sonner";

export default function SignupForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("fullName") ?? "").trim();
    const result = await signUpWithEmail(email, password, name || undefined);

    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success("Account created successfully!");
    window.location.assign(result.redirectTo ?? "/onboarding");
  }

  async function handleGoogleSignUp() {
    const result = await signInWithGoogle();

    if (!result.ok) {
      toast.error(result.message);
    } else {
      toast.success("Account created successfully!");
    }
  }

  return (
    <div className="flex items-center justify-center px-1 py-8 sm:px-8">
      <div className="w-full max-w-[355px]">
        <Link
          aria-label="Grasp home"
          className="inline-flex min-h-10 items-center focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
          href="/"
        >
          <LogoIcon />
        </Link>

        <section aria-labelledby="signup-heading" className="mt-8">
          <h1
            className="font-display text-[29px] font-bold leading-tight tracking-[-0.025em]"
            id="signup-heading"
          >
            Start learning for free.
          </h1>
          <p className="mt-1.5 text-[15px] text-slate-500">
            Create your account and get your first course in under a minute.
          </p>

          <form className="mt-8" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs text-slate-700" htmlFor="fullName">
                Full name
              </label>
              <input
                autoComplete="name"
                className="mt-1.5 h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-1"
                id="fullName"
                name="fullName"
                placeholder="Your name"
                type="text"
              />
            </div>

            <div className="mt-5">
              <label className="text-xs text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                autoComplete="email"
                className="mt-1.5 h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-1"
                id="email"
                name="email"
                placeholder="Enter your email"
                required
                spellCheck={false}
                type="email"
              />
            </div>

            <div className="mt-5">
              <label className="text-xs text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  aria-describedby="password-requirements"
                  autoComplete="new-password"
                  className="h-10 w-full rounded-md border border-slate-300 px-3 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-1"
                  id="password"
                  minLength={8}
                  name="password"
                  placeholder="Enter your password"
                  required
                  spellCheck={false}
                  type={isPasswordVisible ? "text" : "password"}
                />
                <button
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 inline-flex min-w-10 items-center justify-center rounded-r-md text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-inset"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  type="button"
                >
                  <VisibilityIcon visible={isPasswordVisible} />
                </button>
              </div>
              <div
                className="mt-1.5 grid grid-cols-2 gap-x-4 text-[11px] leading-4 text-slate-400"
                id="password-requirements"
              >
                <ul className="list-disc pl-3">
                  <li>minimum 8 characters</li>
                  <li>one number</li>
                  <li>one lowercase character</li>
                </ul>
                <ul className="list-disc pl-3">
                  <li>one special character</li>
                  <li>one uppercase character</li>
                </ul>
              </div>
            </div>

            <button
              className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-[#2563eb] text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="text-white" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <button
            className="mt-3.5 flex h-10 w-full items-center justify-center gap-4 rounded-sm border border-slate-300 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
            onClick={handleGoogleSignUp}
            type="button"
          >
            <GoogleIcon />
            <span>Sign Up with Google</span>
          </button>

          <p className="mt-8 text-center text-sm text-slate-800">
            Already have an account?{" "}
            <Link
              className="text-[#2563eb] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
              href="/signin"
            >
              Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
