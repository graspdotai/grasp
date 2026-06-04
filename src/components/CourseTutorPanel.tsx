"use client";

import { useState, useEffect, useRef } from "react";
import {
  CaretRightIcon,
  CaretDownIcon,
  PaperPlaneTiltIcon,
  PlayIcon,
  PauseIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
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

const BAR_HEIGHTS = [4, 8, 12, 7, 10, 5, 9, 6];

function AudioMessage({ message }: { message: TutorMessage }) {
  const [playing, setPlaying] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!message.audioUrl) return;
    const audio = new Audio(message.audioUrl);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.play().then(() => setPlaying(true)).catch(() => {});
    return () => { audio.pause(); };
  }, [message.audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="flex gap-3 justify-start items-start">
      <span className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center overflow-hidden">
        <span className="scale-[0.32] origin-center block">
          <LogoIcon />
        </span>
      </span>

      <div className="flex flex-col gap-2 max-w-[88%]">
        {/* Loading state */}
        {message.audioLoading && (
          <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
            <span className="text-sm text-neutral-500">Generating audio</span>
            <div className="flex items-end gap-0.5 h-4">
              {BAR_HEIGHTS.map((h, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-neutral-600 rounded-full"
                  animate={{ height: [h, h + 4, h] }}
                  transition={{ repeat: Infinity, duration: 0.6 + i * 0.06, ease: "easeInOut", delay: i * 0.05 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Audio player */}
        {message.audioUrl && (
          <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
            <div className="flex items-end gap-0.5 h-5 flex-1">
              {BAR_HEIGHTS.map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary/60 rounded-full"
                  animate={playing ? { height: [h, h + 10, h] } : { height: h }}
                  transition={{ repeat: Infinity, duration: 0.45 + i * 0.06, ease: "easeInOut", delay: i * 0.04 }}
                />
              ))}
            </div>
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 hover:bg-primary/30 flex items-center justify-center text-primary transition-all"
            >
              {playing
                ? <PauseIcon size={14} weight="fill" />
                : <PlayIcon size={14} weight="fill" />}
            </button>
          </div>
        )}

        {/* Transcript toggle — only once audio is ready */}
        {message.audioUrl && (
          <>
            <button
              onClick={() => setTranscriptOpen((p) => !p)}
              className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-400 transition-colors self-start"
            >
              <CaretDownIcon
                size={11}
                weight="bold"
                className={`transition-transform duration-200 ${transcriptOpen ? "" : "-rotate-90"}`}
              />
              {transcriptOpen ? "Hide transcript" : "Show transcript"}
            </button>

            <AnimatePresence initial={false}>
              {transcriptOpen && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-sm text-neutral-400 leading-relaxed overflow-hidden"
                >
                  {message.text}
                </motion.p>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Fallback: show text if TTS failed (no audioUrl, not loading) */}
        {!message.audioUrl && !message.audioLoading && (
          <p className="text-sm text-neutral-400 leading-relaxed pt-0.5">{message.text}</p>
        )}
      </div>
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
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitQuestion(draft);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmitQuestion(draft);
    }
  };

  return (
    <aside
      className={`relative h-full min-h-0 transition-all duration-300 ${
        isOpen ? "lg:col-span-3" : "lg:col-span-1"
      }`}
    >
      {/* Floating collapse / expand FAB */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Collapse questions" : "Open questions"}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 shadow-xl transition-all duration-200"
      >
        <CaretRightIcon
          size={11}
          weight="bold"
          className={`transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.section
            key="open"
            id="classroom-question-panel"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full min-h-0 rounded-2xl flex flex-col bg-neutral-900 border border-white/[0.07] overflow-hidden"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-4 pt-4 pb-3 flex items-center gap-2.5 border-b border-white/[0.05]">
              <span className="flex-shrink-0 flex items-center justify-center overflow-hidden w-5 h-6">
                <span className="scale-[0.38] origin-left block">
                  <LogoIcon />
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white leading-none">Tutor</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-none truncate">{sectionTitle}</p>
              </div>
            </div>

            {/* Message thread */}
            <div className="min-h-0 grow overflow-y-auto px-4 py-4 flex flex-col gap-5">
              {messages.map((message) => {
                const isStudent = message.role === "student";

                if (!isStudent && (message.audioLoading || message.audioUrl !== undefined)) {
                  return <AudioMessage key={message.id} message={message} />;
                }

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isStudent ? "justify-end" : "justify-start items-start"}`}
                  >
                    {!isStudent && (
                      <span className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center overflow-hidden">
                        <span className="scale-[0.32] origin-center block">
                          <LogoIcon />
                        </span>
                      </span>
                    )}
                    <div
                      className={`max-w-[88%] text-sm leading-relaxed ${
                        isStudent
                          ? "bg-white/10 border border-white/[0.08] text-neutral-200 px-4 py-2.5 rounded-2xl rounded-br-sm"
                          : "text-neutral-400 pt-0.5"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                );
              })}

              {isAnswering && (
                <div className="flex gap-3 justify-start items-center" aria-live="polite">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center overflow-hidden">
                    <span className="scale-[0.32] origin-center block">
                      <LogoIcon />
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 rounded-full bg-neutral-600 animate-pulse"
                        style={{ animationDelay: `${dot * 160}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts */}
            <div className="flex-shrink-0 px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
              {suggestedQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => onSubmitQuestion(question)}
                  disabled={isAnswering}
                  className="flex-shrink-0 rounded-full border border-white/[0.08] px-3 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-200 hover:border-white/20 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Input box */}
            <form onSubmit={handleFormSubmit} className="flex-shrink-0 px-3 pb-3">
              <div className="rounded-2xl border border-white/[0.09] bg-neutral-950/60 focus-within:border-white/[0.18] transition-colors overflow-hidden">
                <textarea
                  id="classroom-question"
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Ask anything about this slide…"
                  spellCheck
                  disabled={isAnswering}
                  className="w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-sm text-white placeholder:text-neutral-700 focus:outline-none disabled:opacity-50 leading-relaxed"
                />
                <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                  <span className="text-xs text-neutral-700 select-none">⏎ send</span>
                  <button
                    type="submit"
                    disabled={!draft.trim() || isAnswering}
                    aria-busy={isAnswering}
                    aria-label="Send question"
                    className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center hover:bg-primary-600 disabled:opacity-25 disabled:pointer-events-none transition-all"
                  >
                    <PaperPlaneTiltIcon size={13} weight="fill" />
                  </button>
                </div>
              </div>
            </form>
          </motion.section>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="scale-[0.45] origin-center block">
                <LogoIcon />
              </span>
              <span className="text-[10px] font-semibold text-neutral-300 tracking-widest [writing-mode:vertical-rl]">
                Ask a question
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
