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
  messages: TutorMessage[];
  isAnswering: boolean;
  suggestedQuestions: string[];
  onSubmitQuestion: (question: string) => void;
  draft: string;
  onDraftChange: (value: string) => void;
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

function AudioReply({ message }: { message: TutorMessage }) {
  const [playing, setPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-5"
      >
        <div className="flex items-center justify-center">
          <VoiceBars active />
        </div>
      </motion.div>
    );
  }

  if (!message.audioUrl) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
        <p className="text-sm leading-relaxed text-neutral-300">{message.text}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause spoken answer" : "Play spoken answer"}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors duration-150 ease-out hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        >
          {playing ? <PauseIcon size={17} weight="fill" /> : <PlayIcon size={17} weight="fill" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Tutor answered out loud</p>
          <p className="truncate text-xs text-neutral-500">Replay or read the transcript</p>
        </div>
        <VoiceBars active={playing} />
      </div>

      <button
        type="button"
        onClick={() => setShowTranscript((value) => !value)}
        className="mt-3 min-h-10 rounded-full px-3 text-xs font-semibold text-neutral-400 transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
      >
        {showTranscript ? "Hide transcript" : "Show transcript"}
      </button>

      <AnimatePresence initial={false}>
        {showTranscript && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pt-1 text-sm leading-relaxed text-neutral-300"
          >
            {message.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CourseTutorPanel({
  isOpen,
  onToggle,
  sectionTitle,
  messages,
  isAnswering,
  suggestedQuestions,
  onSubmitQuestion,
  draft,
  onDraftChange,
}: Props) {
  const shouldReduceMotion = useReducedMotion();
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const draftRef = useRef(draft);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");

  const latestStudentMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "student"),
    [messages],
  );
  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );

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
    };

    recognitionRef.current = recognition;

    return () => {
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
              className="w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-950/95 text-white shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10">
                  <span className="block origin-center scale-[0.38]">
                    <LogoIcon />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Ask by voice</p>
                  <p className="truncate text-xs text-neutral-500">{sectionTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={onToggle}
                  aria-label="Close voice questions"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  <XIcon size={17} weight="bold" />
                </button>
              </div>

              <div className="space-y-4 px-4 py-4">
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] px-4 py-5 text-center">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={isAnswering}
                    aria-pressed={isRecording}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform duration-150 ease-out hover:scale-[1.03] hover:bg-primary-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 motion-reduce:transition-none motion-reduce:hover:scale-100"
                  >
                    {isRecording ? (
                      <StopIcon size={28} weight="fill" />
                    ) : (
                      <MicrophoneIcon size={30} weight="fill" />
                    )}
                  </button>

                  <div className="mt-4">
                    <VoiceBars active={isRecording || isAnswering} />
                    <p className="mt-2 text-sm font-medium text-neutral-200">
                      {isRecording
                        ? "Listening..."
                        : isAnswering
                          ? "Thinking through your question"
                          : "Tap to record your question"}
                    </p>
                  </div>
                </div>

                <div className="min-h-20 rounded-2xl border border-white/[0.08] bg-neutral-900/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600">
                    Heard
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                    {transcript || "Your question will appear here while you speak."}
                  </p>
                </div>

                {speechError && (
                  <p className="rounded-2xl border border-danger-500/20 bg-danger-500/10 px-4 py-3 text-sm text-danger-100">
                    {speechError}
                  </p>
                )}

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {suggestedQuestions.map((question) => (
                    <button
                      type="button"
                      key={question}
                      onClick={() => askSuggestion(question)}
                      disabled={isAnswering}
                      className="min-h-10 flex-shrink-0 rounded-full border border-white/[0.08] px-3 text-xs font-semibold text-neutral-400 transition-colors duration-150 ease-out hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    >
                      {question}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={submitVoiceQuestion}
                  disabled={!canAsk}
                  aria-busy={isAnswering}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 transition-colors duration-150 ease-out hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  <SparkleIcon size={16} weight="fill" />
                  Ask Grasp
                </button>

                {latestStudentMessage && (
                  <div className="space-y-3 border-t border-white/[0.06] pt-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600">
                        Last question
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-300">
                        {latestStudentMessage.text}
                      </p>
                    </div>
                    {latestAssistantMessage && <AudioReply message={latestAssistantMessage} />}
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
              ? "w-14 bg-neutral-800 text-white shadow-black/30 hover:bg-neutral-700"
              : "border border-white/[0.08] bg-neutral-950 pl-2 pr-5 text-white shadow-black/50 hover:border-white/[0.15] hover:bg-neutral-900 active:scale-[0.97]"
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
