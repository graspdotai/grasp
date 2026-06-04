"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import LogoIcon from "@/components/Logo";
import { saveOnboardingDetails } from "@/lib/auth/client";

const STEPS = [
  {
    eyebrow: "Tell us about yourself",
    title: "What describes you best?",
    description:
      "Choose up to 5. This helps us shape courses around your goals.",
    options: [
      "Student",
      "Working professional",
      "Entrepreneur",
      "Creative",
      "Career switcher",
      "Teacher",
      "Freelancer",
      "Curious learner",
      "Small business owner",
      "Job seeker",
      "Parent",
      "Community leader",
      "Artisan",
      "Farmer",
      "Healthcare worker",
      "Tech beginner",
      "Content creator",
      "Researcher",
      "Recent graduate",
      "Retiree",
    ],
  },
  {
    eyebrow: "Choose your direction",
    title: "What would you like to learn?",
    description:
      "Select a few interests. You can always explore something new later.",
    options: [
      "Digital skills",
      "Business",
      "Technology",
      "Design",
      "Marketing",
      "Personal finance",
      "Communication",
      "Career growth",
      "Languages",
      "Everyday skills",
    ],
  },
  {
    eyebrow: "Make learning yours",
    title: "How do you want to learn?",
    description:
      "Choose your preferred lesson language and a pace that fits your day.",
    options: [],
  },
] as const;

const LANGUAGES = ["English", "French"] as const;
const LESSON_LENGTHS = ["5 min", "10 min", "15 min"] as const;

type SelectionMap = Record<number, string[]>;

export default function OnboardingFlow() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<SelectionMap>({ 0: [], 1: [] });
  const [language, setLanguage] = useState("English");
  const [lessonLength, setLessonLength] = useState("10 min");
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentStep = STEPS[step];
  const selectedOptions = selections[step] ?? [];
  const canContinue = step === 2 || selectedOptions.length > 0;

  function toggleOption(option: string) {
    setSelections((current) => {
      const options = current[step] ?? [];
      const isSelected = options.includes(option);

      if (step === 0 && !isSelected && options.length >= 5) {
        return current;
      }

      const nextOptions = isSelected
        ? options.filter((item) => item !== option)
        : [...options, option];

      return { ...current, [step]: nextOptions };
    });
  }

  async function continueFlow() {
    if (!canContinue) return;
    setErrorMessage("");

    if (step === STEPS.length - 1) {
      setIsSaving(true);
      const result = await saveOnboardingDetails({
        learnerTypes: selections[0] ?? [],
        learningInterests: selections[1] ?? [],
        lessonLanguage: language,
        lessonLength,
      });
      setIsSaving(false);

      if (!result.ok) {
        setErrorMessage(result.message);

        if (result.message.toLowerCase().includes("sign in")) {
          window.setTimeout(() => router.push("/signin"), 900);
        }

        return;
      }

      setIsComplete(true);
      window.setTimeout(() => router.push("/"), reduceMotion ? 0 : 700);
      return;
    }

    setStep((current) => current + 1);
  }

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0, 0, 0.2, 1] as const };

  return (
    <main className="min-h-screen bg-white px-5 py-5 text-slate-900 sm:px-8 sm:py-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <Link
          aria-label="Grasp home"
          className="inline-flex min-h-11 items-center focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          href="/"
        >
          <LogoIcon />
        </Link>
        <p className="text-xs font-medium text-slate-400">
          Step {step + 1} of {STEPS.length}
        </p>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-92px)] max-w-xl items-center">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-center"
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 10 }}
              key="complete"
              transition={transition}
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-600 text-white">
                <Check aria-hidden size={22} weight="bold" />
              </div>
              <h1 className="font-display mt-5 text-3xl font-semibold tracking-[-0.035em]">
                Your learning space is ready.
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                We&apos;re preparing course recommendations that match your goals
                and learning style.
              </p>
            </motion.section>
          ) : (
            <motion.section
              animate={{ opacity: 1, x: 0 }}
              className="w-full py-10"
              exit={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -16 }}
              initial={{ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : 16 }}
              key={step}
              transition={transition}
            >
              <ProgressIndicator currentStep={step} reduceMotion={reduceMotion} />

              <h1 className="font-display mt-6 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                {currentStep.title}
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                {currentStep.description}
              </p>

              {step < 2 ? (
                <div className="mt-7 flex flex-wrap gap-2">
                  {currentStep.options.map((option) => (
                    <OptionButton
                      isDisabled={
                        step === 0 &&
                        selectedOptions.length >= 5 &&
                        !selectedOptions.includes(option)
                      }
                      isSelected={selectedOptions.includes(option)}
                      key={option}
                      label={option}
                      onClick={() => toggleOption(option)}
                      reduceMotion={reduceMotion}
                    />
                  ))}
                </div>
              ) : (
                <PreferencesStep
                  language={language}
                  lessonLength={lessonLength}
                  onLanguageChange={setLanguage}
                  onLessonLengthChange={setLessonLength}
                  reduceMotion={reduceMotion}
                />
              )}

              <div className="mt-10 flex items-center gap-3">
                <motion.button
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-600 transition-colors duration-100 ease-out hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={step === 0}
                  onClick={() => setStep((current) => current - 1)}
                  type="button"
                >
                  <ArrowLeft aria-hidden size={16} />
                  Back
                </motion.button>
                <motion.button
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-medium text-white transition-colors duration-100 ease-out hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!canContinue || isSaving}
                  onClick={continueFlow}
                  type="button"
                >
                  {isSaving ? "Saving..." : step === STEPS.length - 1 ? "Finish" : "Continue"}
                  <ArrowRight aria-hidden size={16} />
                </motion.button>
              </div>

              {errorMessage && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ProgressIndicator({
  currentStep,
  reduceMotion,
}: {
  currentStep: number;
  reduceMotion: boolean | null;
}) {
  return (
    <div aria-label={`Step ${currentStep + 1} of ${STEPS.length}`} className="flex gap-1.5">
      {STEPS.map((_, index) => (
        <motion.span
          animate={{ backgroundColor: index <= currentStep ? "#2563eb" : "#e2e8f0" }}
          className="h-1 w-10 rounded-full"
          key={index}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
        />
      ))}
    </div>
  );
}

function OptionButton({
  isSelected,
  isDisabled = false,
  label,
  onClick,
  reduceMotion,
}: {
  isSelected: boolean;
  isDisabled?: boolean;
  label: string;
  onClick: () => void;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.button
      animate={{
        backgroundColor: isSelected ? "#2563eb" : "#ffffff",
        borderColor: isSelected ? "#2563eb" : "#e2e8f0",
        color: isSelected ? "#ffffff" : "#334155",
        scale: isSelected ? 1.015 : 1,
      }}
      aria-pressed={isSelected}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
      disabled={isDisabled}
      onClick={onClick}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 500, damping: 32 }
      }
      type="button"
      whileHover={reduceMotion ? undefined : { scale: isSelected ? 1.025 : 1.01 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    >
      <AnimatePresence initial={false}>
        {isSelected && (
          <motion.span
            animate={{ opacity: 1, scale: 1, width: 14 }}
            exit={{ opacity: 0, scale: 0.7, width: 0 }}
            initial={{ opacity: 0, scale: 0.7, width: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
          >
            <Check aria-hidden className="shrink-0" size={14} weight="bold" />
          </motion.span>
        )}
      </AnimatePresence>
      {label}
    </motion.button>
  );
}

function PreferencesStep({
  language,
  lessonLength,
  onLanguageChange,
  onLessonLengthChange,
  reduceMotion,
}: {
  language: string;
  lessonLength: string;
  onLanguageChange: (language: string) => void;
  onLessonLengthChange: (length: string) => void;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="mt-7 space-y-7">
      <PreferenceGroup
        label="Lesson language"
        onChange={onLanguageChange}
        options={LANGUAGES}
        reduceMotion={reduceMotion}
        selectedOption={language}
      />
      <PreferenceGroup
        label="Lesson length"
        onChange={onLessonLengthChange}
        options={LESSON_LENGTHS}
        reduceMotion={reduceMotion}
        selectedOption={lessonLength}
      />
    </div>
  );
}

function PreferenceGroup({
  label,
  onChange,
  options,
  reduceMotion,
  selectedOption,
}: {
  label: string;
  onChange: (option: string) => void;
  options: readonly string[];
  reduceMotion: boolean | null;
  selectedOption: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <OptionButton
            isSelected={selectedOption === option}
            key={option}
            label={option}
            onClick={() => onChange(option)}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </fieldset>
  );
}
