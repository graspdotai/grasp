"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CourseTutorPanel, { TutorMessage } from "@/components/CourseTutorPanel";
import CourseThumbnail from "@/components/CourseThumbnail";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PlayIcon,
  SparkleIcon,
  CheckIcon,
  XIcon,
  PauseIcon,
  TranslateIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ClockIcon,
  ArrowRightIcon,
  GearIcon,
  SquaresFourIcon,
  CornersInIcon,
  CornersOutIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import SectionReferenceLinks from "@/components/SectionReferenceLinks";
import SlideContent from "@/components/SlideContent";
import {
  isUuid,
  onboardingLanguageToTts,
  updateModuleProgress,
  type CourseSection,
  type Slide,
} from "@/lib/courseApi";
import { useCourse } from "@/hooks/useCourse";
import { sourcesForSection, type CourseSourceLink } from "@/lib/sectionSources";

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const isLiveCourse = isUuid(courseId);

  // State management
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [courseTitle, setCourseTitle] = useState("Loading course…");
  const [courseSummary, setCourseSummary] = useState("");
  const [learnerLevelLabel, setLearnerLevelLabel] = useState("");
  const [courseLoadError, setCourseLoadError] = useState<string | null>(null);
  const courseQuery = useCourse(courseId);
  const isCourseLoading = isLiveCourse && courseQuery.isLoading;
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  // Dynamic active slide index (0-indexed)
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isClassEnded, setIsClassEnded] = useState<boolean>(false);
  const activeSlideIdxRef = useRef<number>(activeSlideIdx);
  useEffect(() => {
    activeSlideIdxRef.current = activeSlideIdx;
  }, [activeSlideIdx]);

  const [isClassroomFullscreen, setIsClassroomFullscreen] = useState<boolean>(false);
  const classroomSlideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsClassroomFullscreen(document.fullscreenElement === classroomSlideRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleClassroomFullscreen = () => {
    if (!classroomSlideRef.current) return;
    if (!document.fullscreenElement) {
      classroomSlideRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable full-screen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const [isPlayingClass, setIsPlayingClass] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("english");
  const [isTTSLoading, setIsTTSLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsFallback, setTtsFallback] = useState<boolean>(false);
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] =
    useState<boolean>(false);
  const [questionDraft, setQuestionDraft] = useState<string>("");
  const [isAnsweringQuestion, setIsAnsweringQuestion] =
    useState<boolean>(false);
  const [questionThreads, setQuestionThreads] = useState<
    Record<string, TutorMessage[]>
  >({});
  const [isSlideSelectorOpen, setIsSlideSelectorOpen] =
    useState<boolean>(false);
  const [courseSources, setCourseSources] = useState<CourseSourceLink[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeSection =
    sections.find((s) => s.id === activeSectionId) || sections[0];
  const activeSlide =
    activeSection?.slides[activeSlideIdx] || activeSection?.slides[0];

  useEffect(() => {
    if (!isLiveCourse) return;

    if (courseQuery.error) {
      setCourseLoadError(
        courseQuery.error instanceof Error
          ? courseQuery.error.message
          : "Failed to load course",
      );
      return;
    }

    if (!courseQuery.data) return;

    setCourseLoadError(null);
    const data = courseQuery.data;
    setSections(data.sections);
    setCourseSources(data.sources ?? []);
    setCourseTitle(data.course.title);
    setCourseSummary(data.course.summary || data.course.goal);
    setLearnerLevelLabel(
      data.course.learnerLevel.charAt(0).toUpperCase() +
        data.course.learnerLevel.slice(1),
    );
    const firstIncomplete = data.sections.find((s) => !s.completed);
    const targetSectionId = firstIncomplete?.id || data.sections[0]?.id || "";
    setActiveSectionId((prev) => prev || targetSectionId);
    if (data.course.onboarding?.language) {
      setLanguage(onboardingLanguageToTts(data.course.onboarding.language));
    }
  }, [courseQuery.data, courseQuery.error, isLiveCourse]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const completedCount = sections.filter((s) => s.completed).length;
  const progressPercent =
    sections.length > 0
      ? Math.round((completedCount / sections.length) * 100)
      : 0;
  const activeSectionIdx = sections.findIndex((s) => s.id === activeSectionId);
  const prevSection =
    activeSectionIdx > 0 ? sections[activeSectionIdx - 1] : null;
  const nextSection =
    activeSectionIdx >= 0 && activeSectionIdx < sections.length - 1
      ? sections[activeSectionIdx + 1]
      : null;
  const defaultQuestionThread: TutorMessage[] = activeSection
    ? [
        {
          id: `${activeSectionId}-intro`,
          role: "assistant",
          text: `Ask me anything about ${activeSection.title}. I can explain what we're covering, give an example, or help you review the key points.`,
        },
      ]
    : [];
  const activeQuestionThread =
    questionThreads[activeSectionId] || defaultQuestionThread;
  const suggestedQuestions = [
    "Explain this simply",
    "Give me an example",
    "What should I remember?",
  ];

  // When changing active sections, reset slide index
  const selectSection = (id: string) => {
    setActiveSectionId(id);
    setActiveSlideIdx(0);
    if (isPlayingClass) {
      closeAudioClass();
    }
  };

  const toggleSectionCompleted = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const section = sections.find((s) => s.id === id);
    if (!section) return;

    const nextCompleted = !section.completed;

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, completed: nextCompleted } : sec,
      ),
    );

    if (isLiveCourse) {
      void updateModuleProgress(courseId, id, nextCompleted).catch(() => {
        setSections((prev) =>
          prev.map((sec) =>
            sec.id === id ? { ...sec, completed: !nextCompleted } : sec,
          ),
        );
      });
    }
  };

  const speakAnswer = async (
    text: string,
    messageId: string,
    sectionId: string,
  ) => {
    try {
      const res = await fetch("/api/aethex/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language, streaming: false }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setQuestionThreads((prev) => ({
        ...prev,
        [sectionId]: (prev[sectionId] || []).map((m) =>
          m.id === messageId ? { ...m, audioLoading: false, audioUrl: url } : m,
        ),
      }));
    } catch {
      setQuestionThreads((prev) => ({
        ...prev,
        [sectionId]: (prev[sectionId] || []).map((m) =>
          m.id === messageId ? { ...m, audioLoading: false } : m,
        ),
      }));
    }
  };

  const submitQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isAnsweringQuestion) {
      return;
    }

    const sectionId = activeSectionId;
    const currentThread = questionThreads[sectionId] || defaultQuestionThread;

    const studentMessage: TutorMessage = {
      id: `question-${Date.now()}`,
      role: "student",
      text: trimmedQuestion,
    };

    setQuestionDraft("");
    setQuestionThreads((prev) => ({
      ...prev,
      [sectionId]: [...currentThread, studentMessage],
    }));
    setIsAnsweringQuestion(true);

    try {
      const res = await fetch("/api/course/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          history: currentThread.filter((m) => m.id !== `${sectionId}-intro`),
          context: {
            sectionTitle: activeSection.title,
            slideTitle: activeSlide.title,
            slidePoints: activeSlide.points,
            slideExplanation: activeSlide.explanationText,
          },
        }),
      });

      const data = await res.json();
      const answerText = res.ok
        ? data.answer
        : "Something went wrong. Please try again.";
      const msgId = `answer-${Date.now()}`;

      setQuestionThreads((prev) => ({
        ...prev,
        [sectionId]: [
          ...(prev[sectionId] || []),
          {
            id: msgId,
            role: "assistant",
            text: answerText,
            audioLoading: res.ok,
          },
        ],
      }));

      if (res.ok) speakAnswer(answerText, msgId, sectionId);
    } catch {
      setQuestionThreads((prev) => ({
        ...prev,
        [sectionId]: [
          ...(prev[sectionId] || []),
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            text: "Couldn't reach the tutor right now. Please try again.",
          },
        ],
      }));
    } finally {
      setIsAnsweringQuestion(false);
    }
  };

  const handleQuestionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuestion(questionDraft);
  };

  // Close audio player & clean up
  const closeAudioClass = () => {
    setIsPlayingClass(false);
    setIsTTSLoading(false);
    setIsSlideSelectorOpen(false);
    setIsClassEnded(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  // Trigger Aethex TTS or use pregenerated Cloudinary URL and start reading current slide aloud
  const playSlideAudio = async (slide: Slide) => {
    setIsTTSLoading(true);
    setTtsFallback(false);

    // Stop existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      let url = slide.audioUrl;

      if (!url) {
        console.log(
          "No pregenerated audioUrl found. Falling back to real-time TTS synthesis.",
        );
        const response = await fetch("/api/aethex/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: slide.explanationText,
            language: language,
            streaming: false,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to synthesize speech");
        }

        const blob = await response.blob();
        url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        if (!activeSection?.slides) return;
        console.log(
          `[page.tsx] Audio for slide ${activeSlideIdxRef.current} ended.`,
        );
        // Auto advance slide if not last
        if (activeSlideIdxRef.current < activeSection.slides.length - 1) {
          const nextIdx = activeSlideIdxRef.current + 1;
          console.log(`[page.tsx] Auto-advancing to slide ${nextIdx}`);
          setActiveSlideIdx(nextIdx);
          playSlideAudio(activeSection.slides[nextIdx]);
        } else {
          // Finished whole section
          console.log(
            "[page.tsx] Reached end of section. Marking as completed.",
          );
          setIsClassEnded(true);
          setSections((prev) =>
            prev.map((sec) =>
              sec.id === activeSection.id ? { ...sec, completed: true } : sec,
            ),
          );
          if (isLiveCourse) {
            console.log("[page.tsx] Syncing completion to backend...");
            void updateModuleProgress(courseId, activeSection.id, true).catch(
              () => {},
            );
          }
        }
      };

      console.log(
        `[page.tsx] Playing audio for slide ${activeSlideIdxRef.current}`,
      );
      audio.play().catch((err) => {
        console.error("Audio autoplay error:", err);
        setTtsFallback(true);
      });
    } catch (err: any) {
      console.warn("Aethex TTS synthesis fell back to simulation.", err);
      setTtsFallback(true);
    } finally {
      setIsTTSLoading(false);
    }
  };

  const startFullClassroom = async () => {
    if (!activeSection?.slides?.length) return;
    setIsPlayingClass(true);
    setIsClassEnded(false);
    setActiveSlideIdx(0);
    // Start speaking slide 1 immediately
    await playSlideAudio(activeSection.slides[0]);
  };

  const handlePrevSlide = () => {
    if (!activeSection?.slides) return;
    if (activeSlideIdx > 0) {
      const nextIdx = activeSlideIdx - 1;
      setActiveSlideIdx(nextIdx);
      if (isPlayingClass) {
        playSlideAudio(activeSection.slides[nextIdx]);
      }
    }
  };

  const handleNextSlide = () => {
    if (!activeSection?.slides) return;
    if (activeSlideIdx < activeSection.slides.length - 1) {
      const nextIdx = activeSlideIdx + 1;
      setActiveSlideIdx(nextIdx);
      if (isPlayingClass) {
        playSlideAudio(activeSection.slides[nextIdx]);
      }
    }
  };

  // Re-trigger audio if user switches languages while in classroom
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (isPlayingClass && activeSection?.slides?.[activeSlideIdx]) {
      // Re-synthesize current slide with the new language
      setTimeout(() => {
        playSlideAudio(activeSection.slides[activeSlideIdx]);
      }, 50);
    }
  };

  // Toggle play/pause of the current audio speech
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => setTtsFallback(true));
      } else {
        audioRef.current.pause();
      }
      // Force render update
      setTtsFallback((prev) => prev);
    } else if (ttsFallback) {
      // If we are in fallback, toggle a simulated play state
      setTtsFallback(false);
      setTimeout(() => setTtsFallback(true), 50);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // ─── Classroom keyboard navigation ───────────────────────────
  // Use refs so the single stable event listener always sees fresh state and methods.
  const kbStateRef = useRef({
    isPlayingClass,
    isClassEnded,
    activeSlideIdx,
    slideCount: 0 as number,
    handleNextSlide,
    handlePrevSlide,
    togglePlayPause,
    closeAudioClass,
    playSlideAudio,
    activeSection: null as any,
  });
  // Update ref every render so the handler always has fresh values
  kbStateRef.current = {
    isPlayingClass,
    isClassEnded,
    activeSlideIdx,
    slideCount: activeSection?.slides.length ?? 0,
    handleNextSlide,
    handlePrevSlide,
    togglePlayPause,
    closeAudioClass,
    playSlideAudio,
    activeSection,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const {
        isPlayingClass: playing,
        isClassEnded: ended,
        activeSlideIdx: idx,
        slideCount,
        handleNextSlide: next,
        handlePrevSlide: prev,
        togglePlayPause: toggle,
        closeAudioClass: close,
        playSlideAudio: play,
        activeSection: section,
      } = kbStateRef.current;

      console.log("[Grasp Classroom KB]", {
        key: e.key,
        playing,
        ended,
        idx,
        slideCount,
        target: (e.target as HTMLElement)?.tagName,
      });

      if (!playing) return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (ended) {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          setIsClassEnded(false);
          setActiveSlideIdx(slideCount - 1);
          if (section?.slides?.[slideCount - 1]) {
            play(section.slides[slideCount - 1]);
          }
        }
        return;
      }

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        if (idx < slideCount - 1) {
          const nextIdx = idx + 1;
          setActiveSlideIdx(nextIdx);
          if (section?.slides?.[nextIdx]) {
            play(section.slides[nextIdx]);
          }
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (idx > 0) {
          const prevIdx = idx - 1;
          setActiveSlideIdx(prevIdx);
          if (section?.slides?.[prevIdx]) {
            play(section.slides[prevIdx]);
          }
        }
      } else if (e.key === " ") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAudioPlaying = audioRef.current ? !audioRef.current.paused : false;
  const isCourseReady = Boolean(activeSection && activeSlide);
  const sectionSources = activeSection
    ? sourcesForSection(activeSection.title, courseSources)
    : [];

  if (isLiveCourse && !isCourseReady) {
    if (courseLoadError) {
      return (
        <main className="p-6 max-w-7xl mx-auto min-h-screen bg-white">
          <Navbar />
          <div className="mt-6 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeftIcon size={14} weight="bold" />
              <span>Back to Courses</span>
            </Link>
          </div>
          <div className="mt-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <p className="text-lg font-semibold text-neutral-900">
              Couldn&apos;t load this course
            </p>
            <p className="text-sm text-red-600 mt-2">{courseLoadError}</p>
            <Link
              href="/"
              className="mt-6 text-sm font-semibold text-primary hover:underline"
            >
              Back to courses
            </Link>
          </div>
        </main>
      );
    }

    return (
      <main className="p-6 max-w-7xl mx-auto min-h-screen bg-white animate-pulse">
        <Navbar />
        {/* Back link */}
        <div className="mt-6 mb-6">
          <div className="h-4 bg-neutral-100 rounded-md w-28 animate-pulse" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="grow">
            <div className="h-3 bg-neutral-200 rounded-md w-16 mb-2" />
            <div className="h-8 bg-neutral-200 rounded-md w-1/3 mb-2" />
            <div className="h-4 bg-neutral-200 rounded-md w-1/2" />
          </div>
          <div className="w-full md:w-80 flex flex-col gap-2">
            <div className="h-4 bg-neutral-200 rounded-md w-1/2 mb-1" />
            <div className="h-2 bg-neutral-100 rounded-full w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 mt-8">
          {/* Syllabus skeleton */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-neutral-50 rounded-3xl p-6">
              <div className="h-4 bg-neutral-200 rounded-md w-1/3 mb-4" />
              <div className="flex flex-col gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-neutral-200 shrink-0" />
                    <div className="grow">
                      <div className="h-3 bg-neutral-200 rounded-md w-1/4 mb-1.5" />
                      <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="h-7 bg-neutral-200 rounded-md w-1/2 mb-2" />
            <div className="h-4 bg-neutral-200 rounded-md w-full mb-1" />
            <div className="h-4 bg-neutral-200 rounded-md w-5/6" />

            <div className="mt-4 pt-4 border-t border-neutral-100">
              <div className="h-3 bg-neutral-200 rounded-md w-1/4 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-4 w-4 bg-neutral-200 rounded-full shrink-0" />
                    <div className="h-4 bg-neutral-200 rounded-md grow" />
                  </div>
                ))}
              </div>
            </div>

            {/* Slide container skeleton */}
            <div className="h-10 bg-neutral-100 rounded-t-3xl mt-10 w-full" />
            <div className="bg-neutral-900 aspect-video rounded-3xl rounded-t-none p-8 flex flex-col justify-between" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto min-h-screen bg-white">
      <Navbar />

      <div className="mt-6 mb-6 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeftIcon size={14} weight="bold" />
          <span>Back to Courses</span>
        </Link>
        {isLiveCourse && (
          <Link
            href={`/course/${courseId}/settings`}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
              <GearIcon size={16} weight="bold" />
            </div>
          </Link>
        )}
      </div>

      {/* Course Title and Progress Header - FLAT aesthetic (No shadows) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-100">
        <div className="max-w-2xl">
          {learnerLevelLabel && (
            <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
              <span>{learnerLevelLabel}</span>
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight">
            {courseTitle}
          </h1>
          {courseSummary && (
            <p className="text-neutral-500 text-sm mt-1 leading-relaxed line-clamp-3">
              {courseSummary}
            </p>
          )}
          {courseLoadError && (
            <p className="text-sm text-red-600 mt-2">{courseLoadError}</p>
          )}
          {isCourseLoading && (
            <p className="text-sm text-neutral-500 mt-2">Loading course…</p>
          )}
        </div>

        <div className="w-full md:w-80 flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-neutral-700">
              Course Progress
            </span>
            <span className="font-bold text-primary">
              {progressPercent}% complete
            </span>
          </div>
          <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-neutral-400 text-right">
            {completedCount} of {sections.length} modules completed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 mt-8">
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-neutral-50 rounded-3xl px-5 py-6">
            <h2 className="text-sm font-medium text-neutral-500 px-2 mb-3">
              Course Syllabus
            </h2>

            <div className="flex flex-col gap-2">
              {sections.map((section, index) => {
                const isActive = section.id === activeSectionId;
                return (
                  <div
                    key={section.id}
                    onClick={() => selectSection(section.id)}
                    className={`group w-full flex items-start gap-3 p-4 rounded-2xl text-left cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "bg-primary/5"
                        : "bg-transparent hover:bg-primary/5"
                    }`}
                  >
                    <button
                      onClick={(e) => toggleSectionCompleted(section.id, e)}
                      className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full border transition-all duration-200 ${
                        section.completed
                          ? "bg-success-500 border-success-600 text-white"
                          : "bg-white text-transparent group-hover:text-primary/30"
                      }`}
                    >
                      {section.completed ? (
                        <CheckIcon size={12} weight="bold" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </button>

                    <div className="grow">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <ClockIcon
                            size={12}
                            weight="bold"
                            className="text-neutral-400"
                          />
                          <span className="text-xs text-neutral-500">
                            {section.duration}
                          </span>
                        </div>
                      </div>
                      <h3
                        className={`text-sm font-medium mt-0.5 transition-colors duration-150 ${
                          isActive
                            ? "text-primary font-medium"
                            : "text-neutral-800 group-hover:text-neutral-900"
                        }`}
                      >
                        {section.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col">
            <div className="bg-white rounded-2xl flex flex-col gap-2">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  {activeSection.title}
                </h2>
                <p className="text-neutral-600 text-sm leading-relaxed mt-2 line-clamp-3">
                  {activeSection.description}
                </p>
              </div>

              <div className="mt-2 pt-4 border-t border-neutral-100 max-w-3xl">
                <h4 className="text-xs text-neutral-500 mb-3">
                  What you will learn in this section:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeSection.keyPoints.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-sm text-neutral-600"
                    >
                      <CheckCircleIcon
                        size={16}
                        weight="fill"
                        className="text-primary mt-0.5 flex-shrink-0"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="z-10 pr-3 pl-6 flex items-center justify-between flex-wrap gap-4 bg-neutral-50 rounded-t-3xl mt-12 py-3">
              <div className="flex items-center justify-between z-10">
                <div className="text-neutral-500 font-mono text-xs tracking-wider">
                  {activeSection.slides.length} Slides
                </div>
              </div>
              <button
                onClick={startFullClassroom}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white font-medium text-sm px-5 py-2 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>Start Class</span>
                <ArrowRightIcon weight="bold" size={16} />
              </button>
            </div>
            <div className="bg-neutral-950 aspect-video rounded-3xl rounded-t-none relative overflow-hidden flex flex-col justify-between text-white">
              <div className="absolute inset-0 z-0">
                <CourseThumbnail title={courseTitle} hideContent />
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
              </div>
              <div className="my-auto z-10 flex flex-col gap-4 p-8 relative">
                {/* Hide the header for layouts that render their own title */}
                {activeSlide.layout !== "title" &&
                  activeSlide.layout !== "statement" && (
                    <h3 className="text-xl md:text-2xl font-serif text-white tracking-tight drop-shadow-md">
                      {activeSlide.title}
                    </h3>
                  )}

                <SlideContent
                  title={activeSlide.title}
                  points={activeSlide.points}
                  diagramQuery={activeSlide.diagramQuery}
                  layout={activeSlide.layout}
                  variant="dark"
                  pointClassName="text-xs md:text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm"
                />
              </div>
            </div>

            <SectionReferenceLinks sources={sectionSources} />

            {/* Bottom Navigation */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-neutral-100 pt-8">
              {/* Previous Button */}
              {prevSection ? (
                <button
                  onClick={() => selectSection(prevSection.id)}
                  className="flex items-center gap-4 p-5 border border-neutral-200 hover:border-primary/30 hover:bg-neutral-50/50 rounded-2xl text-left group transition-all duration-200 cursor-pointer"
                >
                  <div className="bg-neutral-100 rounded-xl h-10 w-10 flex items-center justify-center text-neutral-500 group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                    <CaretLeftIcon size={18} weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Previous Section
                    </p>
                    <p className="text-sm font-bold text-neutral-800 group-hover:text-primary transition-colors truncate mt-0.5">
                      {prevSection.title}
                    </p>
                  </div>
                </button>
              ) : (
                <div />
              )}

              {nextSection ? (
                <button
                  onClick={() => selectSection(nextSection.id)}
                  className="flex items-center justify-between p-5 border border-neutral-200 hover:border-primary/30 hover:bg-neutral-50/50 rounded-2xl text-right group transition-all duration-200 cursor-pointer"
                >
                  <div className="min-w-0 pr-4 grow">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Next Section
                    </p>
                    <p className="text-sm font-bold text-neutral-800 group-hover:text-primary transition-colors truncate mt-0.5">
                      {nextSection.title}
                    </p>
                  </div>
                  <div className="bg-neutral-100 rounded-xl h-10 w-10 flex items-center justify-center text-neutral-500 group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                    <CaretRightIcon size={18} weight="bold" />
                  </div>
                </button>
              ) : (
                <Link
                  href={isLiveCourse ? "/" : "/course/javascript-basics"}
                  className="flex items-center justify-between p-5 border border-neutral-200 hover:border-primary/30 hover:bg-neutral-50/50 rounded-2xl text-right group transition-all duration-200"
                >
                  <div className="min-w-0 pr-4 grow">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      {isLiveCourse ? "Finish Course" : "Next Course"}
                    </p>
                    <p className="text-sm font-bold text-neutral-800 group-hover:text-primary transition-colors truncate mt-0.5">
                      {isLiveCourse ? "Back to Dashboard" : "JavaScript basics"}
                    </p>
                  </div>
                  <div className="bg-neutral-100 rounded-xl h-10 w-10 flex items-center justify-center text-neutral-500 group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                    <CaretRightIcon size={18} weight="bold" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPlayingClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-neutral-50 text-neutral-900 flex flex-col p-6 md:p-8 select-none"
          >
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={closeAudioClass}
                  className="inline-flex items-center py-4 px-4 bg-neutral-50 hover:bg-neutral-100 text-sm font-bold text-neutral-500 hover:text-neutral-800 rounded-full transition-all cursor-pointer border border-neutral-200/60"
                >
                  <XIcon size={16} weight="bold" />
                </button>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-400 tracking-widest">
                    Topic
                  </h4>
                  <p className="text-sm font-bold text-neutral-800">
                    {activeSection.title}
                  </p>
                </div>
              </div>

              {/* <button
                onClick={() => setIsSlideSelectorOpen((prev) => !prev)}
                className={`p-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border border-neutral-200/60 ${
                  isSlideSelectorOpen
                    ? "bg-primary text-white border-primary"
                    : "bg-white hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800"
                }`}
                title="Select Slide"
              >
                <SquaresFourIcon size={20} weight="bold" />
              </button> */}
            </div>

            <div className="grow grid grid-cols-1 lg:grid-cols-12 gap-5 my-6 overflow-hidden min-h-0 relative">
              <AnimatePresence>
                {isSlideSelectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-0 z-30 bg-neutral-50/95 backdrop-blur-md border border-neutral-200/60 rounded-2xl p-6 md:p-8 overflow-y-auto flex flex-col text-neutral-900"
                  >
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-neutral-900">
                        Slide Deck Preview
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Select a slide to jump directly to it.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {activeSection.slides.map((slide, idx) => {
                        const isCurrent = idx === activeSlideIdx;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setActiveSlideIdx(idx);
                              setIsSlideSelectorOpen(false);
                              if (isPlayingClass) {
                                playSlideAudio(slide);
                              }
                            }}
                            className={`group rounded-2xl h-24 flex flex-col justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 relative overflow-hidden select-none ${
                              isCurrent ? "ring-2 ring-white" : ""
                            }`}
                          >
                            <div className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity">
                              <CourseThumbnail
                                title={courseTitle}
                                hideContent
                              />
                              <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
                            </div>

                            {/* Slide Number Badge */}
                            <span className="absolute top-3 right-3 z-20 font-mono text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">
                              {String(idx + 1).padStart(2, "0")}
                            </span>

                            <div className="pr-10 p-4 relative z-10">
                              <h4 className="text-sm font-bold font-serif text-white transition-colors line-clamp-2 leading-tight drop-shadow-md">
                                {slide.title}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <CourseTutorPanel
                isOpen={isQuestionPanelOpen}
                onToggle={() => setIsQuestionPanelOpen((prev) => !prev)}
                sectionTitle={activeSection.title}
                isAnswering={isAnsweringQuestion}
                onSubmitQuestion={submitQuestion}
                draft={questionDraft}
                onDraftChange={setQuestionDraft}
                tutorMessage={
                  activeQuestionThread[activeQuestionThread.length - 1]
                    ?.role === "assistant"
                    ? activeQuestionThread[activeQuestionThread.length - 1]
                    : undefined
                }
                onRecordingStateChange={(isRecording) => {
                  if (isRecording) {
                    audioRef.current?.pause();
                  } else if (
                    !isAnsweringQuestion &&
                    audioRef.current?.paused &&
                    !audioRef.current?.ended &&
                    !isClassEnded
                  ) {
                    audioRef.current?.play().catch(() => setTtsFallback(true));
                  }
                }}
                onTutorAudioPlayStateChange={(isPlaying) => {
                  if (
                    !isPlaying &&
                    !isAnsweringQuestion &&
                    audioRef.current?.paused &&
                    !audioRef.current?.ended &&
                    !isClassEnded
                  ) {
                    audioRef.current?.play().catch(() => setTtsFallback(true));
                  } else if (isPlaying) {
                    audioRef.current?.pause();
                  }
                }}
              />

              <div className="lg:col-span-12 flex items-center justify-center w-full h-full min-h-0">
                <div
                  ref={classroomSlideRef}
                  className={`bg-neutral-950 flex flex-col text-white relative overflow-hidden transition-all ${
                    isClassroomFullscreen
                      ? "w-screen h-screen justify-center items-center rounded-none"
                      : "w-full max-w-7xl aspect-video rounded-4xl"
                  }`}
                >
                  <div className="absolute inset-0 z-0">
                    <CourseThumbnail title={courseTitle} hideContent />
                    <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                  </div>

                  {/* Fullscreen Toggle Button */}
                  <button
                    onClick={toggleClassroomFullscreen}
                    className="absolute top-4 right-4 z-30 p-2.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-full text-white/80 hover:text-white backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title={isClassroomFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
                  >
                    {isClassroomFullscreen ? (
                      <CornersInIcon size={16} weight="bold" />
                    ) : (
                      <CornersOutIcon size={16} weight="bold" />
                    )}
                  </button>

                  {isClassEnded ? (
                    <div className="flex flex-col gap-4 max-w-xl mx-auto w-full my-auto z-10 p-8 md:p-12 relative items-center text-center">
                      <CheckCircleIcon
                        weight="fill"
                        className="text-white w-14 h-14 drop-shadow-md"
                      />

                      <h2 className="text-4xl md:text-5xl font-serif text-white drop-shadow-md">
                        Lesson Completed
                      </h2>
                      <p className="text-lg text-white/80 font-medium drop-shadow-sm">
                        You've finished the lesson on {activeSection.title}.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button
                          onClick={closeAudioClass}
                          className="px-6 py-3 rounded-full bg-white text-neutral-900 font-bold hover:bg-neutral-200 transition-colors shadow-lg"
                        >
                          Return to Course
                        </button>
                        <button
                          onClick={() => {
                            setIsClassEnded(false);
                            setActiveSlideIdx(0);
                            playSlideAudio(activeSection.slides[0]);
                          }}
                          className="px-6 py-3 rounded-full bg-black/30 text-white font-bold hover:bg-black/50 transition-colors shadow-lg backdrop-blur-md"
                        >
                          Retake Lesson
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Classroom slide — layout-aware wrapper */}
                      <div
                        className={`w-full my-auto z-10 relative overflow-y-auto mx-auto ${
                          isClassroomFullscreen
                            ? "max-w-[85vw] px-8 md:px-16 pb-36 pt-8"
                            : "max-w-5xl px-8 pb-28 pt-6"
                        } ${
                          activeSlide.layout === "visual" ||
                          activeSlide.layout === "title"
                            ? "flex flex-col items-center justify-center h-full"
                            : "flex flex-col gap-4"
                        }`}
                      >
                        {/* Title shown inline only for non-self-titling layouts */}
                        {activeSlide.layout !== "title" &&
                          activeSlide.layout !== "statement" && (
                            <>
                              <h2
                                className={`font-serif text-white tracking-tight leading-tight drop-shadow-md ${
                                  isClassroomFullscreen ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"
                                }`}
                              >
                                {activeSlide.title}
                              </h2>
                              <div className="h-0.5 w-16 bg-white/40 mt-1 mb-4" />
                            </>
                          )}

                        <SlideContent
                          title={activeSlide.title}
                          points={activeSlide.points}
                          diagramQuery={activeSlide.diagramQuery}
                          layout={activeSlide.layout}
                          variant="dark"
                          pointClassName={
                            isClassroomFullscreen
                              ? "text-lg md:text-2xl text-white/95 leading-relaxed font-medium drop-shadow-sm"
                              : "text-base md:text-lg text-white/95 leading-relaxed font-medium drop-shadow-sm"
                          }
                          isFullscreen={isClassroomFullscreen}
                        />
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 z-20">
                        {/* Slide controls */}
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2.5 rounded-full text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 transition-all cursor-pointer disabled:opacity-30"
                            onClick={handlePrevSlide}
                            disabled={activeSlideIdx === 0}
                            title="Previous slide (←)"
                          >
                            <CaretLeftIcon size={14} weight="bold" />
                          </button>
                          <span className="px-4 py-1.5 bg-black/30 rounded-full text-white backdrop-blur-md border border-white/10 text-sm font-mono font-semibold min-w-[64px] text-center">
                            {activeSlideIdx + 1} / {activeSection.slides.length}
                          </span>
                          {activeSlideIdx ===
                          activeSection.slides.length - 1 ? (
                            <button
                              className="px-4 py-1.5 rounded-full text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 transition-all cursor-pointer text-xs font-bold uppercase tracking-wider"
                              title="End class"
                              onClick={() => {
                                if (audioRef.current) {
                                  audioRef.current.pause();
                                }
                                setIsClassEnded(true);
                                setSections((prev) =>
                                  prev.map((sec) =>
                                    sec.id === activeSection.id
                                      ? { ...sec, completed: true }
                                      : sec,
                                  ),
                                );
                                if (isLiveCourse) {
                                  void updateModuleProgress(
                                    courseId,
                                    activeSection.id,
                                    true,
                                  ).catch(() => {});
                                }
                              }}
                            >
                              End Class
                            </button>
                          ) : (
                            <button
                              className="p-2.5 rounded-full text-white bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 transition-all cursor-pointer"
                              onClick={handleNextSlide}
                              title="Next slide (→)"
                            >
                              <CaretRightIcon size={14} weight="bold" />
                            </button>
                          )}
                        </div>
                        {/* Keyboard hint row */}
                        {/* <div className="flex items-center gap-3 text-white/30 text-[10px] font-mono select-none">
                          <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white/40 text-[9px]">←</kbd> <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/40 text-[9px]">→</kbd> navigate</span>
                          <span className="text-white/15">·</span>
                          <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white/40 text-[9px]">Space</kbd> pause</span>
                          <span className="text-white/15">·</span>
                          <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white/40 text-[9px]">Esc</kbd> exit</span>
                        </div> */}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
