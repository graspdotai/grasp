"use client";

import { useEffect, useRef, useState } from "react";
import { AudioEngine } from "@/lib/audio/audioEngine";

export default function TestTTS() {
  const [text, setText] = useState(
    "Hello! Welcome to Grasp AI. This is a live real-time test of our Aethex Text-To-Speech streaming integration.",
  );
  const [language, setLanguage] = useState("english");
  const [streaming, setStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isStreamingPlaying, setIsStreamingPlaying] = useState(false);
  const audioEngineRef = useRef<AudioEngine | null>(null);

  if (!audioEngineRef.current) {
    audioEngineRef.current = new AudioEngine();
  }

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioEngineRef.current) {
        void audioEngineRef.current.stop();
      }
    };
  }, [audioUrl]);

  const getErrorMessage = (err: unknown): string =>
    err instanceof Error ? err.message : "An unexpected error occurred";

  const handleSynthesize = async () => {
    setIsLoading(true);
    setError(null);
    setWarning(null);
    setAudioUrl(null);
    setIsStreamingPlaying(false);

    if (audioEngineRef.current) {
      await audioEngineRef.current.stop();
    }

    try {
      const result = await audioEngineRef.current!.synthesize(
        {
          text,
          language,
          streaming,
        },
        {
          onStreamStateChange: setIsStreamingPlaying,
        },
      );

      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
      }
      if (result.warning) {
        setWarning(result.warning);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      await audioEngineRef.current?.stop();
      setIsStreamingPlaying(false);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl flex flex-col gap-6 relative z-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Aethex Speech Lab
          </h1>
          <p className="text-slate-400 text-sm">
            Convert text into speech. Falls back to browser voice if Aethex is unavailable.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Script Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Type your script here..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="english">English</option>
              <option value="french">French</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Engine Mode
            </label>
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-slate-400 text-sm">
              Aethex primary, browser fallback
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-lg p-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">
              Real-time PCM16 Streaming
            </span>
            <span className="text-xs text-slate-500">
              Play audio chunks as soon as they are generated
            </span>
          </div>
          <button
            onClick={() => setStreaming(!streaming)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${
              streaming ? "bg-blue-600" : "bg-slate-800"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform duration-200 ease-in-out ${
                streaming ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSynthesize}
            disabled={isLoading || !text}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading
              ? streaming
                ? "Streaming speech..."
                : "Generating audio..."
              : streaming
                ? "Stream and Play Speech"
                : "Synthesize Speech"}
          </button>

          <button
            onClick={handleStop}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 rounded-lg transition-colors"
          >
            Stop Playback
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm leading-relaxed">
            <span className="font-semibold block mb-1">Synthesis Failed</span>
            {error}
          </div>
        )}

        {warning && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-lg text-sm leading-relaxed">
            <span className="font-semibold block mb-1">Fallback Active</span>
            {warning}
          </div>
        )}

        {isStreamingPlaying && (
          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-lg flex items-center gap-3 animate-pulse">
            <div className="flex gap-1 items-center justify-center h-4 w-4">
              <span
                className="w-1 h-3 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <span
                className="w-1 h-4 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-1 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
            <span className="text-sm text-blue-400 font-medium">
              Playing live stream from audio engine...
            </span>
          </div>
        )}

        {audioUrl && (
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg flex flex-col gap-3">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Generated Audio
            </span>
            <audio
              src={audioUrl}
              controls
              className="w-full accent-emerald-500"
              autoPlay
            />
          </div>
        )}
      </div>
    </div>
  );
}
