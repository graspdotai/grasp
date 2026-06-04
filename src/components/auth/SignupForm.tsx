"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LogoIcon from "@/components/Logo";
import { GoogleIcon, VisibilityIcon } from "@/components/auth/icons";
import { signInWithGoogle, signUpWithEmail } from "@/lib/auth/client";

export default function SignupForm() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const result = await signUpWithEmail(email, password);

    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    if (result.needsEmailConfirmation) {
      setSuccessMessage("Check your email to confirm your account, then come back to sign in.");
      return;
    }

    router.push("/onboarding");
  }

  async function handleGoogleSignUp() {
    setErrorMessage("");
    setSuccessMessage("");
    const result = await signInWithGoogle();

    if (!result.ok) {
      setErrorMessage(result.message);
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
            Create an Account
          </h1>
          <p className="mt-1.5 text-[15px] text-slate-500">
            Get your free Grasp account now.
          </p>

          <form className="mt-8" onSubmit={handleSubmit}>
            <div>
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
              className="mt-5 h-10 w-full rounded-sm bg-[#2563eb] text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {errorMessage && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {successMessage}
            </p>
          )}

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
