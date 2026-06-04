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

  useEffect(() => {
    isAnsweringRef.current = isAnswering;
  }, [isAnswering]);

  useEffect(() => {
    onRecordingStateChange?.(isRecording);
  }, [isRecording, onRecordingStateChange]);

  const transcript = `${draft}${interimTranscript ? ` ${interimTranscript}` : ""}`.trim();
  const canAsk = Boolean(draft.trim()) && !isAnswering;

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

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
    recognition.onstart = () => {
      setIsRecording(true);
      setSpeechError(null);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event) => {
      setIsRecording(false);
      setSpeechError(
        event.error === "not-allowed"
          ? "Microphone access is blocked."
          : "I couldn't hear that clearly.",
      );
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

      if (finalText.trim()) {
        onDraftChange(`${draftRef.current} ${finalText}`.trim());
      }
      setInterimTranscript(interimText.trim());

      // Silence detection logic
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (!isAnsweringRef.current) {
          recognitionRef.current?.stop();
          setInterimTranscript("");
          // Note: using draftRef because draft might be stale
          const finalDraft = `${draftRef.current} ${finalText}`.trim();
          if (finalDraft) {
            onSubmitQuestion(finalDraft);
          }
        }
      }, 2000);
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [onDraftChange]);

  useEffect(() => {
    if (!isOpen && isRecording) {
      recognitionRef.current?.stop();
    }
  }, [isOpen, isRecording]);

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

  const submitVoiceQuestion = () => {
    if (!canAsk) return;
    recognitionRef.current?.stop();
    setInterimTranscript("");
    onSubmitQuestion(draft);
  };

  const askSuggestion = (question: string) => {
    recognitionRef.current?.stop();
    setInterimTranscript("");
    onSubmitQuestion(question);
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
                    type="button"
                    onClick={toggleRecording}
                    disabled={isAnswering}
                    aria-pressed={isRecording}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform duration-150 ease-out hover:scale-[1.03] hover:bg-primary-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:scale-100"
                  >
                    {isRecording ? (
                      <StopIcon size={28} weight="fill" />
                    ) : (
                      <MicrophoneIcon size={30} weight="fill" />
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

                {speechError && (
                  <p className="rounded-2xl border border-danger-500/20 bg-danger-500/10 px-4 py-3 text-sm text-danger-600">
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
