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

const BAR_HEIGHTS = [3, 6, 10, 6, 3];

function VoiceBars({ active }: { active: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex h-4 items-end gap-0.5" aria-hidden="true">
      {BAR_HEIGHTS.map((height, index) => (
        <motion.span
          key={index}
          className={`w-0.5 rounded-full ${active ? "bg-primary" : "bg-neutral-300"}`}
          animate={
            active && !shouldReduceMotion
              ? { height: [height, height * 2.2, height] }
              : { height }
          }
          transition={{
            duration: 0.6,
            repeat: active && !shouldReduceMotion ? Infinity : 0,
            ease: "easeInOut",
            delay: index * 0.08,
          }}
        />
      ))}
    </div>
  );
}

function AudioReply({
  message,
  autoPlay = true,
  onPlayStateChange,
  onDismiss,
}: {
  message: TutorMessage;
  autoPlay?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  onDismiss?: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;

  useEffect(() => {
    onPlayStateChange?.(playing);
  }, [playing, onPlayStateChange]);

  useEffect(() => {
    if (!message.audioUrl) return;

    const audio = new Audio(message.audioUrl);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);

    if (autoPlayRef.current) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }

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

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  if (message.audioLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100">
          <VoiceBars active />
        </div>
        <p className="text-sm text-neutral-500">Preparing answer…</p>
      </motion.div>
    );
  }

  if (!message.audioUrl) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Pause answer" : "Play answer"}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-600 transition-colors"
      >
        {playing ? <PauseIcon size={15} weight="fill" /> : <PlayIcon size={15} weight="fill" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-800">Tutor's answer</p>
        <p className="text-xs text-neutral-400">{playing ? "Playing…" : "Tap to replay"}</p>
      </div>
      <VoiceBars active={playing} />
      {onDismiss && (
        <button
          type="button"
          onClick={() => { audioRef.current?.pause(); onDismiss(); }}
          aria-label="Dismiss answer"
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        >
          <XIcon size={14} weight="bold" />
        </button>
      )}
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
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastErrorRef = useRef<string | null>(null);
  const draftRef = useRef(draft);
  const isAnsweringRef = useRef(isAnswering);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isAwake, setIsAwake] = useState(false);
  const [isAudioDismissed, setIsAudioDismissed] = useState(false);
  const [isTutorAudioPlaying, setIsTutorAudioPlaying] = useState(false);
  const isTutorAudioPlayingRef = useRef(false);
  const playedMessageIdsRef = useRef<Set<string>>(new Set());
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
    setIsAudioDismissed(false);
  }, [tutorMessage?.id]);

  useEffect(() => {
    isAwakeRef.current = isAwake;
    onRecordingStateChangeRef.current?.(isAwake);
  }, [isAwake]);

  useEffect(() => {
    isTutorAudioPlayingRef.current = isTutorAudioPlaying;
  }, [isTutorAudioPlaying]);

  const transcript =
    `${draft}${interimTranscript ? ` ${interimTranscript}` : ""}`.trim();

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
      console.log(
        "[CourseTutorPanel] SpeechRecognition started. isAwake:",
        isAwakeRef.current,
      );
      setIsRecording(true);
      setSpeechError(null);
      lastErrorRef.current = null;
      shouldRestart = true;
    };

    recognition.onend = () => {
      console.log(
        "[CourseTutorPanel] SpeechRecognition ended. isAwake:",
        isAwakeRef.current,
      );
      setIsRecording(false);

      // Auto-restart only if panel is open, active, not answering, and tutor audio is not playing.
      if (
        isOpenRef.current &&
        isAwakeRef.current &&
        !isAnsweringRef.current &&
        !isTutorAudioPlayingRef.current &&
        shouldRestart
      ) {
        const restartDelay = lastErrorRef.current === "aborted" ? 3000 : 0;

        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

        restartTimerRef.current = setTimeout(() => {
          if (
            !isOpenRef.current ||
            !isAwakeRef.current ||
            isAnsweringRef.current ||
            isTutorAudioPlayingRef.current ||
            !shouldRestart
          )
            return;
          try {
            recognition.start();
            console.log(
              "[CourseTutorPanel] Successfully auto-restarted SpeechRecognition.",
            );
          } catch (err) {
            console.error(
              "[CourseTutorPanel] Failed to auto-restart SpeechRecognition:",
              err,
            );
          }
        }, restartDelay);
      } else {
        console.log(
          `[CourseTutorPanel] Did not restart. isOpen: ${isOpenRef.current}, isAwake: ${isAwakeRef.current}, isAnswering: ${isAnsweringRef.current}`,
        );
      }
      shouldRestart = true;
    };

    recognition.onerror = (event) => {
      console.warn("[CourseTutorPanel] SpeechRecognition error:", event.error);
      lastErrorRef.current = event.error;
      if (
        ["not-allowed", "audio-capture", "not-supported"].includes(event.error)
      ) {
        shouldRestart = false;
        setSpeechError(
          event.error === "not-allowed"
            ? "Microphone access is blocked."
            : `Microphone error: ${event.error}`,
        );
        setIsRecording(false);
      } else if (event.error === "aborted") {
        console.log(
          "[CourseTutorPanel] Speech recognition aborted. Will attempt restart with delay if active.",
        );
      }
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      console.log(
        `[CourseTutorPanel] Transcribed - Final: "${finalText}" | Interim: "${interimText}"`,
      );

      if (finalText.trim()) {
        const newDraft = `${draftRef.current} ${finalText}`.trim();
        console.log(
          "[CourseTutorPanel] Appending final text to draft:",
          newDraft,
        );
        onDraftChangeRef.current(newDraft);
      }
      setInterimTranscript(interimText.trim());

      // Silence detection logic
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      console.log("[CourseTutorPanel] Silence timer reset. Waiting 2s...");
      silenceTimerRef.current = setTimeout(() => {
        console.log(
          "[CourseTutorPanel] Silence timer fired! 2 seconds passed.",
        );
        if (!isAnsweringRef.current) {
          setInterimTranscript("");
          const finalDraft = `${draftRef.current} ${finalText}`.trim();
          if (finalDraft) {
            console.log(
              "[CourseTutorPanel] Submitting voice question:",
              finalDraft,
            );
            onSubmitQuestionRef.current(finalDraft);
            setIsAwake(false);
          } else {
            console.log(
              "[CourseTutorPanel] Draft is empty, going back to sleep.",
            );
            setIsAwake(false);
          }
        }
      }, 2000);
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  // Sync isOpen state to microphone active state (isAwake)
  useEffect(() => {
    if (isOpen) {
      setIsAwake(true);
      onDraftChangeRef.current("");
      setIsTutorAudioPlaying(false);
    } else {
      setIsAwake(false);
      setInterimTranscript("");
      setIsTutorAudioPlaying(false);
    }
  }, [isOpen]);

  // Reactive control effect for starting/stopping the microphone
  useEffect(() => {
    if (!speechSupported || !recognitionRef.current) return;

    const shouldListen = isOpen && isAwake && !isAnswering && !isTutorAudioPlaying;

    if (shouldListen) {
      if (!isRecording) {
        console.log(
          "[CourseTutorPanel] Starting SpeechRecognition (open & active)...",
        );
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn(
            "[CourseTutorPanel] SpeechRecognition start failed:",
            err,
          );
        }
      }
    } else {
      if (isRecording) {
        console.log(
          "[CourseTutorPanel] Stopping SpeechRecognition (closed or idle)...",
        );
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Already stopped
        }
      }
    }
  }, [isOpen, isAwake, isAnswering, isTutorAudioPlaying, isRecording, speechSupported]);

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
        try {
          recognitionRef.current?.start();
        } catch {}
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
    <div className="pointer-events-none fixed bottom-5 right-4 z-[70] sm:right-6">
      <div className="pointer-events-auto flex w-full max-w-[25rem] sm:w-[25rem] flex-col items-end gap-3">
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.section
              key="voice-recorder"
              initial={
                shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 10, scale: 0.98 }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 0.2,
                ease: "easeOut",
              }}
              aria-label="Voice question recorder"
              className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-xl shadow-black/8"
            >
              {/* Mic + status */}
              <div className="flex flex-col items-center gap-3 px-5 pt-6 pb-5">
                <button
                  onClick={toggleMic}
                  disabled={!speechSupported}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${
                    isAwake
                      ? "border-danger-400 bg-danger-500 text-white hover:bg-danger-600"
                      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  } ${!speechSupported ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                >
                  {isAwake ? (
                    <div className="flex items-center gap-[3px]">
                      <motion.div animate={{ height: ["4px", "10px", "4px"] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-[3px] rounded-full bg-white" />
                      <motion.div animate={{ height: ["7px", "14px", "7px"] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.15 }} className="w-[3px] rounded-full bg-white" />
                      <motion.div animate={{ height: ["4px", "10px", "4px"] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.3 }} className="w-[3px] rounded-full bg-white" />
                    </div>
                  ) : (
                    <MicrophoneIcon size={17} weight="regular" />
                  )}
                </button>

                <p className="text-xs text-neutral-400">
                  {isRecording ? "Listening…" : isAnswering ? "Thinking…" : "Tap to ask a question"}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-neutral-100" />

              {/* Transcript */}
              <div className="px-5 py-4 min-h-16">
                <p className={`text-sm leading-relaxed ${transcript ? "text-neutral-800" : "text-neutral-400"}`}>
                  {transcript || "Your question will appear here…"}
                </p>
              </div>

              {/* Error */}
              {speechError && (
                <div className="mx-5 mb-4 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600">
                  {speechError}
                </div>
              )}

              {/* Audio reply */}
              {tutorMessage && !isAudioDismissed && (tutorMessage.audioLoading || tutorMessage.audioUrl) && (
                <>
                  <div className="h-px bg-neutral-100" />
                  <div className="px-5 py-4">
                    <AudioReply
                      message={tutorMessage}
                      autoPlay={!playedMessageIdsRef.current.has(tutorMessage.id)}
                      onPlayStateChange={(playing) => {
                        if (playing) playedMessageIdsRef.current.add(tutorMessage.id);
                        setIsTutorAudioPlaying(playing);
                        if (playing) setInterimTranscript("");
                        onTutorAudioPlayStateChange?.(playing);
                      }}
                      onDismiss={() => {
                        setIsAudioDismissed(true);
                        setIsTutorAudioPlaying(false);
                      }}
                    />
                  </div>
                </>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        <motion.button
          layout
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close" : "Ask a question"}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
          className={`flex h-12 items-center justify-center overflow-hidden rounded-full bg-white/80 backdrop-blur-md ring-1 ring-black/[0.08] shadow-xl shadow-black/[0.08] transition-colors hover:bg-white/95 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            isOpen ? "w-12" : "gap-2 pl-4 pr-5"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="x"
                initial={shouldReduceMotion ? {} : { scale: 0.7, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={shouldReduceMotion ? {} : { scale: 0.7, opacity: 0, rotate: 45 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.14, ease: "easeOut" }}
                className="flex items-center justify-center text-neutral-500"
              >
                <XIcon size={15} weight="bold" />
              </motion.span>
            ) : (
              <motion.span
                key="closed"
                initial={shouldReduceMotion ? {} : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, x: 8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.14, ease: "easeOut" }}
                className="flex items-center gap-2"
              >
                <MicrophoneIcon size={17} weight="regular" className="text-primary" />
                <span className="text-sm font-medium text-neutral-700 tracking-tight">Ask anything</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
