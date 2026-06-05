"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MicrophoneIcon,
  PauseIcon,
  PlayIcon,
  SparkleIcon,
  StopIcon,
  XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LogoIcon from "@/components/Logo";

export interface TutorMessage {
  id: string;
  role: "student" | "assistant";
  text: string;
  audioUrl?: string;
  audioLoading?: boolean;
}

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  sectionTitle: string;
  isAnswering: boolean;
  onSubmitQuestion: (question: string) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onTutorAudioPlayStateChange?: (isPlaying: boolean) => void;
  tutorMessage?: TutorMessage;
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult:
    | ((event: {
        resultIndex: number;
        results: {
          length: number;
          [index: number]: {
            isFinal: boolean;
            [index: number]: { transcript: string };
          };
        };
      }) => void)
    | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const BAR_HEIGHTS = [10, 18, 30, 22, 38, 18, 28, 14, 34, 20, 26];

function VoiceBars({ active }: { active: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex h-12 items-center justify-center gap-1.5" aria-hidden="true">
      {BAR_HEIGHTS.map((height, index) => (
        <motion.span
          key={`${height}-${index}`}
          className="w-1.5 rounded-full bg-primary"
          animate={
            active && !shouldReduceMotion
              ? { height: [height, height + 16, height] }
              : { height }
          }
          transition={{
            duration: 0.55 + index * 0.03,
            repeat: active && !shouldReduceMotion ? Infinity : 0,
            ease: "easeInOut",
            delay: index * 0.04,
          }}
        />
      ))}
    </div>
  );
}

function AudioReply({ message, onPlayStateChange }: { message: TutorMessage, onPlayStateChange?: (playing: boolean) => void }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    onPlayStateChange?.(playing);
  }, [playing, onPlayStateChange]);

  useEffect(() => {
    if (!message.audioUrl) return;

    const audio = new Audio(message.audioUrl);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [message.audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  if (message.audioLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-5 mt-4"
      >
        <div className="flex items-center justify-center">
          <VoiceBars active />
        </div>
      </motion.div>
    );
  }

  if (!message.audioUrl) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 mt-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause spoken answer" : "Play spoken answer"}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors duration-150 ease-out hover:bg-primary-600"
        >
          {playing ? <PauseIcon size={17} weight="fill" /> : <PlayIcon size={17} weight="fill" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900">Tutor answered out loud</p>
          <p className="truncate text-xs text-neutral-500">Audio response</p>
        </div>
        <VoiceBars active={playing} />
      </div>
    </div>
  );
}

export default function CourseTutorPanel({
  isOpen,
  onToggle,
  sectionTitle,
  isAnswering,
  onSubmitQuestion,
  draft,
  onDraftChange,
  onRecordingStateChange,
  onTutorAudioPlayStateChange,
  tutorMessage,
}: Props) {
  const shouldReduceMotion = useReducedMotion();
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const draftRef = useRef(draft);
  const isAnsweringRef = useRef(isAnswering);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isAwake, setIsAwake] = useState(false);
  const isAwakeRef = useRef(isAwake);

  const isOpenRef = useRef(isOpen);
  const onToggleRef = useRef(onToggle);
  const onSubmitQuestionRef = useRef(onSubmitQuestion);
  const onDraftChangeRef = useRef(onDraftChange);
  const onRecordingStateChangeRef = useRef(onRecordingStateChange);

  useEffect(() => {
    isOpenRef.current = isOpen;
    onToggleRef.current = onToggle;
    onSubmitQuestionRef.current = onSubmitQuestion;
    onDraftChangeRef.current = onDraftChange;
    onRecordingStateChangeRef.current = onRecordingStateChange;
  });

  useEffect(() => {
    isAnsweringRef.current = isAnswering;
    if (isAnswering && isAwake) {
      setIsAwake(false);
    }
  }, [isAnswering, isAwake]);

  useEffect(() => {
    isAwakeRef.current = isAwake;
    onRecordingStateChangeRef.current?.(isAwake);
  }, [isAwake]);

  const transcript = `${draft}${interimTranscript ? ` ${interimTranscript}` : ""}`.trim();

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let shouldRestart = true;
    recognition.onstart = () => {
      console.log("[CourseTutorPanel] SpeechRecognition started. isAwake:", isAwakeRef.current);
      setIsRecording(true);
      setSpeechError(null);
      shouldRestart = true;
    };
    recognition.onend = () => {
      console.log("[CourseTutorPanel] SpeechRecognition ended. Restarting if not answering...");
      setIsRecording(false);
      if (!isAnsweringRef.current && shouldRestart) {
        try { 
          recognition.start(); 
          console.log("[CourseTutorPanel] Successfully auto-restarted SpeechRecognition.");
        } catch (err) {
          console.error("[CourseTutorPanel] Failed to auto-restart SpeechRecognition:", err);
        }
      } else {
        console.log(`[CourseTutorPanel] Did not restart. isAnswering: ${isAnsweringRef.current}, shouldRestart: ${shouldRestart}`);
      }
      shouldRestart = true;
    };
    recognition.onerror = (event) => {
      console.warn("[CourseTutorPanel] SpeechRecognition error:", event.error);
      if (["not-allowed", "audio-capture", "not-supported"].includes(event.error)) {
        shouldRestart = false;
        setSpeechError(event.error === "not-allowed" ? "Microphone access is blocked." : `Microphone error: ${event.error}`);
        setIsRecording(false);
      } else if (event.error === "aborted") {
        console.log("[CourseTutorPanel] Speech recognition aborted. Will attempt restart.");
      }
    };
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      console.log(`[CourseTutorPanel] Transcribed - Final: "${finalText}" | Interim: "${interimText}" | isAwake: ${isAwakeRef.current}`);

      if (!isAwakeRef.current) {
        const lowerText = (finalText || interimText).toLowerCase();
        if (lowerText.includes("question") || lowerText.includes("grasp") || lowerText.includes("wait")) {
          console.log("[CourseTutorPanel] Wake word detected in text:", lowerText);
          setIsAwake(true);
          onDraftChangeRef.current("");
          if (!isOpenRef.current) onToggleRef.current();
        }
      } else {
        if (finalText.trim()) {
          const newDraft = `${draftRef.current} ${finalText}`.trim();
          console.log("[CourseTutorPanel] Appending final text to draft:", newDraft);
          onDraftChangeRef.current(newDraft);
        }
        setInterimTranscript(interimText.trim());

        // Silence detection logic
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        console.log("[CourseTutorPanel] Silence timer reset. Waiting 2s...");
        silenceTimerRef.current = setTimeout(() => {
          console.log("[CourseTutorPanel] Silence timer fired! 2 seconds passed.");
          if (!isAnsweringRef.current) {
            setInterimTranscript("");
            const finalDraft = `${draftRef.current} ${finalText}`.trim();
            if (finalDraft) {
              console.log("[CourseTutorPanel] Submitting voice question:", finalDraft);
              onSubmitQuestionRef.current(finalDraft);
              setIsAwake(false);
            } else {
               console.log("[CourseTutorPanel] Draft is empty, going back to sleep.");
               setIsAwake(false);
            }
          }
        }, 2000);
      }
    };

    recognitionRef.current = recognition;
    
    // Auto-start on mount
    console.log("[CourseTutorPanel] Mounting SpeechRecognition...");
    try { 
      recognition.start(); 
      console.log("[CourseTutorPanel] Auto-started successfully.");
    } catch (err) {
      console.error("[CourseTutorPanel] Auto-start failed on mount:", err);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const toggleMic = () => {
    if (!speechSupported) return;
    if (isAwake) {
      setIsAwake(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (draft.trim()) {
        onSubmitQuestion(draft.trim());
        setInterimTranscript("");
      }
    } else {
      setIsAwake(true);
      onDraftChange("");
      if (!isRecording) {
        try { recognitionRef.current?.start() } catch {}
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onToggle]);

  const toggleRecording = () => {
    if (!speechSupported) {
      setSpeechError("Voice questions are not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    setInterimTranscript("");
    recognitionRef.current?.start();
  };

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-5 z-[70] flex justify-end sm:inset-x-auto sm:right-6">
      <div className="pointer-events-auto flex w-full max-w-[25rem] flex-col items-end gap-3">
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.section
              key="voice-recorder"
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }
              }
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
              aria-label="Voice question recorder"
              className="w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl shadow-black/10 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10">
                  <span className="block origin-center scale-[0.38]">
                    <LogoIcon />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">Ask by voice</p>
                  <p className="truncate text-xs text-neutral-500">{sectionTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={onToggle}
                  aria-label="Close voice questions"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition-colors duration-150 ease-out hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <XIcon size={17} weight="bold" />
                </button>
              </div>

              <div className="space-y-4 px-4 py-4">
                <div className="rounded-3xl border border-neutral-100 bg-neutral-50 px-4 py-5 text-center">
                  <button
                    onClick={toggleMic}
                    className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 shadow-xl border cursor-pointer mx-auto ${
                      isAwake
                        ? "bg-danger-500 text-white hover:bg-danger-600 border-danger-400"
                        : "bg-white text-neutral-900 hover:bg-neutral-100 border-neutral-200/60"
                    } ${!speechSupported && "opacity-50 cursor-not-allowed"}`}
                    disabled={!speechSupported}
                    title={
                      !speechSupported
                        ? "Speech recognition not supported"
                        : isAwake
                          ? "Click to submit"
                          : "Start asking"
                    }
                  >
                    {isAwake ? (
                      <div className="flex gap-1 items-center">
                        <motion.div
                          animate={{ height: ["8px", "16px", "8px"] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-1.5 bg-white rounded-full"
                        />
                        <motion.div
                          animate={{ height: ["12px", "20px", "12px"] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-1.5 bg-white rounded-full"
                        />
                        <motion.div
                          animate={{ height: ["8px", "16px", "8px"] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-1.5 bg-white rounded-full"
                        />
                      </div>
                    ) : (
                      <MicrophoneIcon size={24} weight="fill" />
                    )}
                  </button>

                  <div className="mt-4">
                    <VoiceBars active={isRecording || isAnswering} />
                    <p className="mt-2 text-sm font-medium text-neutral-600">
                      {isRecording
                        ? "Listening..."
                        : isAnswering
                          ? "Thinking through your question"
                          : "Tap to record your question"}
                    </p>
                  </div>
                </div>

                <div className="min-h-20 rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Heard
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                    {transcript || "Your question will appear here while you speak."}
                  </p>
                </div>

                {!isAwake && isRecording && (
                  <p className="text-center text-[10px] uppercase font-bold tracking-widest text-neutral-400 mt-2">
                    Listening for "I have a question"...
                  </p>
                )}

                {speechError && (
                  <p className="rounded-2xl border border-danger-500/20 bg-danger-500/10 px-4 py-3 text-sm text-danger-600 mt-2">
                    {speechError}
                  </p>
                )}

                {tutorMessage && (tutorMessage.audioLoading || tutorMessage.audioUrl) && (
                  <div className="pt-2">
                    <AudioReply message={tutorMessage} onPlayStateChange={onTutorAudioPlayStateChange} />
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.button
          layout
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Hide voice questions" : "Open voice questions"}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
          className={`flex h-14 items-center justify-center overflow-hidden rounded-full shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
            isOpen
              ? "w-14 bg-neutral-100 text-neutral-800 shadow-black/10 hover:bg-neutral-200"
              : "border border-neutral-200 bg-white pl-2 pr-5 text-neutral-900 shadow-black/10 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.97]"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="x"
                initial={shouldReduceMotion ? {} : { scale: 0.6, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={shouldReduceMotion ? {} : { scale: 0.6, opacity: 0, rotate: 45 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: "easeOut" }}
                className="flex items-center justify-center"
              >
                <XIcon size={20} weight="bold" />
              </motion.span>
            ) : (
              <motion.span
                key="closed"
                initial={shouldReduceMotion ? {} : { opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, x: 6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: "easeOut" }}
                className="flex items-center gap-3"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary shadow-md shadow-primary/30">
                  <MicrophoneIcon size={18} weight="fill" />
                </span>
                <span className="text-sm font-semibold">Ask anything</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
