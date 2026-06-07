"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenIcon,
  SparkleIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import CourseGeneratingOverlay from "@/components/CourseGeneratingOverlay";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { createCourse } from "@/lib/courseApi";
import { useProfile } from "@/hooks/useProfile";
import { getLocalUserId } from "@/lib/userSession";
import { toast } from "sonner";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 14,
    },
  },
} as const;

export default function NewCoursePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [learnerLevel, setLearnerLevel] =
    useState<(typeof LEVELS)[number]["value"]>("beginner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: dbProfile, isLoading: isProfileLoading } = useProfile();
  const onboarding = dbProfile ? {
    personas: dbProfile.learner_types || [],
    interests: dbProfile.learning_interests || [],
    language: dbProfile.lesson_language || "english",
    lessonLength: dbProfile.lesson_length || "short",
  } : undefined;
  const [generationStatus, setGenerationStatus] = useState<string>("");

  // Input focus states for sleek underline animation
  const [isTopicFocused, setIsTopicFocused] = useState(false);
  const [isGoalFocused, setIsGoalFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setGenerationStatus("Analyzing your topic and researching sources...");

    try {
      const userId = getLocalUserId() ?? undefined;
      const data = await createCourse({
        topic: topic.trim(),
        goal: goal.trim(),
        learnerLevel,
        onboarding: onboarding ?? undefined,
        userId,
      }, (progress) => {
        setGenerationStatus(progress.message);
      });
      toast.success("Course created successfully!");
      router.push(`/course/${data.course.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <CourseGeneratingOverlay
        open
        topic={topic.trim()}
        statusText={generationStatus}
      />
    );
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900 pb-24 relative overflow-hidden">
      {/* Subtle grid pattern for premium texture */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none select-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-5 py-5 sm:px-8 sm:py-6 relative z-10">
        <Navbar />

        <div className="mt-8 mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors duration-200"
          >
            <ArrowLeftIcon size={14} weight="bold" />
            <span>Back to Courses</span>
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto flex flex-col gap-12"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="space-y-5">
            <p className="text-neutral-500 text-lg leading-relaxed max-w-xl">
              Describe your topic and learning goal below. Grasp will construct
              a complete, custom course tailored to you.
            </p>
          </motion.div>

          {mounted && (
            <motion.div
              variants={itemVariants}
              className="border-t border-b border-neutral-100 py-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                <UserCircleIcon size={36} className="text-primary" />
                <div>
                  <p className="text-sm text-neutral-500">You</p>
                  {isProfileLoading ? (
                    <span className="text-neutral-400 italic">
                      Loading profile...
                    </span>
                  ) : onboarding && dbProfile?.onboarding_completed ? (
                    <span className="font-medium text-neutral-800">
                      {[
                        onboarding.personas?.[0],
                        onboarding.interests?.[0],
                        onboarding.language,
                        onboarding.lessonLength,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  ) : (
                    <span className="text-neutral-400 italic">
                      No onboarding profile
                    </span>
                  )}
                </div>
              </div>
              <Link
                href="/onboarding"
                className="text-xs bg-primary py-2 px-3 rounded-full text-white font-medium flex items-center space-x-2 hover:bg-primary-700 transition-colors"
              >
                <span>
                  {onboarding ? "Customize Profile" : "Setup Profile"}{" "}
                </span>
                <ArrowRightIcon size={12} weight="bold" />
              </Link>
            </motion.div>
          )}

          {/* Form Section */}
          <motion.div variants={itemVariants}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              {/* Topic Input */}
              <div className="group relative flex flex-col gap-2">
                <label
                  htmlFor="topic-input"
                  className="text-xs font-medium text-neutral-400 transition-colors duration-250 group-focus-within:text-primary"
                >
                  Topic
                </label>
                <input
                  id="topic-input"
                  type="text"
                  required
                  minLength={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onFocus={() => setIsTopicFocused(true)}
                  onBlur={() => setIsTopicFocused(false)}
                  placeholder="e.g. Cell structure"
                  className="w-full bg-transparent py-3 text-lg sm:text-xl text-neutral-900 placeholder-neutral-300 focus:outline-none font-serif transition-all duration-200"
                />
                {/* Visual Underline */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-neutral-200" />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                  animate={{ scaleX: isTopicFocused ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ originX: 0 }}
                />
              </div>

              {/* Goal Input */}
              <div className="group relative flex flex-col gap-2">
                <label
                  htmlFor="goal-input"
                  className="text-xs font-medium text-neutral-400 transition-colors duration-250 group-focus-within:text-primary"
                >
                  Your goal
                </label>
                <textarea
                  id="goal-input"
                  required
                  minLength={3}
                  rows={2}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onFocus={() => setIsGoalFocused(true)}
                  onBlur={() => setIsGoalFocused(false)}
                  placeholder="What should you be able to do or understand after this course?"
                  className="w-full bg-transparent py-3 text-base text-neutral-900 placeholder-neutral-300 focus:outline-none resize-none leading-relaxed transition-all duration-200"
                />
                {/* Visual Underline */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-neutral-200" />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                  animate={{ scaleX: isGoalFocused ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ originX: 0 }}
                />
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-medium text-neutral-400">
                  Learner Level
                </span>
                <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-50 border border-neutral-100 rounded-2xl w-fit max-w-full relative z-0 rounded-full">
                  {LEVELS.map((level) => {
                    const isSelected = learnerLevel === level.value;
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setLearnerLevel(level.value)}
                        className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none select-none ${
                          isSelected
                            ? "text-white"
                            : "text-neutral-500 hover:text-neutral-800"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeLevelBackground"
                            className="absolute inset-0 bg-primary rounded-full z-0"
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 26,
                            }}
                          />
                        )}
                        <span className="relative z-10">{level.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 ml-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-4 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-neutral-900/5 hover:shadow-xl hover:shadow-neutral-900/10 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="text-white" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Course</span>
                      <ArrowUpRightIcon size={20} weight="regular" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
