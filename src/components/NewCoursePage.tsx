"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  SparkleIcon,
  WaveformIcon,
} from "@phosphor-icons/react";
import CourseGeneratingOverlay from "@/components/CourseGeneratingOverlay";
import Navbar from "@/components/Navbar";
import { createCourse } from "@/lib/courseApi";
import { loadOnboardingProfile } from "@/lib/onboardingStorage";
import { getLocalUserId } from "@/lib/userSession";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const PIPELINE = [
  { title: "Research", detail: "Exa pulls trusted sources for your topic" },
  { title: "Syllabus", detail: "Modules and learning objectives are structured" },
  { title: "Lessons", detail: "Slides + voice scripts generated per module" },
  { title: "Classroom", detail: "Learn with Aethex voice and the AI tutor" },
];

export default function NewCoursePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [learnerLevel, setLearnerLevel] =
    useState<(typeof LEVELS)[number]["value"]>("beginner");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboarding, setOnboarding] = useState(loadOnboardingProfile());

  useEffect(() => {
    setOnboarding(loadOnboardingProfile());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const profile = loadOnboardingProfile();
      const userId = getLocalUserId() ?? undefined;
      const data = await createCourse({
        topic: topic.trim(),
        goal: goal.trim(),
        learnerLevel,
        onboarding: profile ?? undefined,
        userId,
      });
      router.push(`/course/${data.course.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <CourseGeneratingOverlay
        open={isSubmitting}
        topic={topic.trim()}
        goal={goal.trim()}
      />
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-5 py-5 sm:px-8 sm:py-6">
        <Navbar />

        <div className="mt-6 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeftIcon size={14} weight="bold" />
            <span>Back to Courses</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left — form */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div className="bg-white rounded-3xl border border-neutral-100 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                <SparkleIcon size={14} weight="fill" />
                <span>New course</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
                What do you want to learn?
              </h1>
              <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
                Tell us your topic and goal. Grasp builds a full voice-ready course in
                about a minute.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-neutral-700">Topic</span>
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Introduction to Cardiac Arrest"
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-neutral-700">Your goal</span>
                  <textarea
                    required
                    minLength={3}
                    rows={4}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="What should you be able to do after this course?"
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-neutral-700">Level</span>
                  <select
                    value={learnerLevel}
                    onChange={(e) =>
                      setLearnerLevel(e.target.value as (typeof LEVELS)[number]["value"])
                    }
                    className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    {LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </label>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Building your course…
                    </>
                  ) : (
                    "Generate course"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right — full-height companion panel */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-3xl bg-primary-600 p-8 sm:p-10 min-h-[220px] flex flex-col justify-between">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border-[40px] border-white/[0.07]" />
              <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full border-[50px] border-white/[0.05]" />

              <div className="relative z-10">
                <p className="text-[11px] font-medium tracking-widest text-white/45 uppercase">
                  Your learning path
                </p>
                <p className="font-serif text-[26px] sm:text-[32px] text-white leading-tight mt-2">
                  From question to voice classroom
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {PIPELINE.map((step, i) => (
                  <div
                    key={step.title}
                    className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm"
                  >
                    <span className="text-[10px] font-bold text-white/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm font-semibold text-white mt-1">{step.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl border border-neutral-100 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-3">
                  <BookOpenIcon size={18} className="text-primary" />
                  Onboarding profile
                </div>
                {onboarding ? (
                  <div className="flex flex-col gap-3 text-sm text-neutral-600">
                    {onboarding.personas.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                          You
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {onboarding.personas.map((p) => (
                            <span
                              key={p}
                              className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {onboarding.interests.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                          Interests
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {onboarding.interests.map((i) => (
                            <span
                              key={i}
                              className="rounded-full bg-neutral-100 text-neutral-700 px-2.5 py-0.5 text-xs font-medium"
                            >
                              {i}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p>
                      <span className="text-neutral-400">Language:</span> {onboarding.language}
                    </p>
                    <p>
                      <span className="text-neutral-400">Pace:</span> {onboarding.lessonLength}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No onboarding yet.{" "}
                    <Link href="/onboarding" className="text-primary font-medium hover:underline">
                      Complete onboarding
                    </Link>{" "}
                    so your course matches your goals.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-neutral-100 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-3">
                  <WaveformIcon size={18} className="text-primary" />
                  What you get
                </div>
                <ul className="flex flex-col gap-2.5 text-sm text-neutral-600">
                  {[
                    "Grounded sources saved to your course",
                    "Modules with slides and key points",
                    "Voice-ready scripts for Aethex TTS",
                    "Interactive tutor on every slide",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircleIcon
                        size={16}
                        weight="fill"
                        className="text-primary shrink-0 mt-0.5"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-100 p-6">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
                How generation works
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PIPELINE.map((step) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <SparkleIcon size={14} className="text-primary" weight="fill" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{step.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
