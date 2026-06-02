"use client";

import { useState, useRef } from "react";

export default function TestTTS() {
  const [text, setText] = useState(
    "Hello! Welcome to Grasp AI. This is a live real-time test of our Aethex Text-To-Speech streaming integration.",
  );
  const [language, setLanguage] = useState("english");
  const [voiceId, setVoiceId] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Real-time streaming state
  const [isStreamingPlaying, setIsStreamingPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scheduledTimeRef = useRef<number>(0);

  // Pre-configured list of popular voices found in your account
  const sampleVoices = [
    { id: "", name: "Default Active Voice (Recommended)" },
    {
      id: "3aa25417-2c1c-5531-809e-f6d0a0b0e5cc",
      name: "Amara (English, Neutral)",
    },
    {
      id: "050d7f37-cc8b-551e-b824-ff3955013190",
      name: "Samuel (English, Male)",
    },
    {
      id: "ced830b2-294e-5ff8-af09-32373a90131f",
      name: "Jackson (English, Male)",
    },
    {
      id: "db5d1b41-3720-5563-9a2a-233ce7b7c4ba",
      name: "Amelia (English, Female)",
    },
  ];

  const handleSynthesize = async () => {
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);
    setIsStreamingPlaying(false);

    // Stop any existing stream playback
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    try {
      const response = await fetch("/api/aethex/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language,
          voice_id: undefined,
          streaming: streaming,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = errorData.error || `Error: ${response.status}`;

        // Friendly fix for the "Voice not linked to an active TTS model" error
        if (errorMsg.includes("Voice not linked to an active TTS model")) {
          errorMsg =
            "Voice not linked to an active TTS model in Aethex. Please use 'Default Active Voice (Recommended)' since this account doesn't have a model bound to that custom voice yet.";
        }
        console.log("[LOG] ", errorMsg);
        console.log("[LOG] ", errorData);
        throw new Error(errorMsg);
      }

      if (streaming) {
        // Stream playback using Web Audio API
        setIsStreamingPlaying(true);
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Could not read stream from response.");

        // Initialize AudioContext at 24000 Hz (mono) as specified in Aethex Docs
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass({ sampleRate: 24000 });
        audioCtxRef.current = audioCtx;
        scheduledTimeRef.current = audioCtx.currentTime;

        let leftOverBuffer: Uint8Array | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Combine leftover bytes with the new chunk
          let chunk = value;
          if (leftOverBuffer) {
            const combined = new Uint8Array(
              leftOverBuffer.length + value.length,
            );
            combined.set(leftOverBuffer);
            combined.set(value, leftOverBuffer.length);
            chunk = combined;
            leftOverBuffer = null;
          }

          // Each sample is 2 bytes (PCM16)
          const numSamples = Math.floor(chunk.length / 2);
          const remainder = chunk.length % 2;

          if (remainder > 0) {
            leftOverBuffer = chunk.slice(chunk.length - remainder);
          }

          if (numSamples === 0) continue;

          // Convert raw PCM16 little-endian bytes to Float32 array
          const float32Data = new Float32Array(numSamples);
          const dataView = new DataView(
            chunk.buffer,
            chunk.byteOffset,
            chunk.byteLength,
          );

          for (let i = 0; i < numSamples; i++) {
            const int16Sample = dataView.getInt16(i * 2, true); // Little-endian
            float32Data[i] = int16Sample / 32768.0; // Float conversion (-1.0 to 1.0)
          }

          // Create an AudioBuffer and schedule it for playback
          const audioBuffer = audioCtx.createBuffer(1, numSamples, 24000);
          audioBuffer.getChannelData(0).set(float32Data);

          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);

          // Schedule buffer to play immediately after the previous scheduled buffer
          const startPlayTime = Math.max(
            scheduledTimeRef.current,
            audioCtx.currentTime,
          );
          source.start(startPlayTime);

          scheduledTimeRef.current = startPlayTime + audioBuffer.duration;
        }

        setIsStreamingPlaying(false);
      } else {
        // Standard full WAV file playback
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
            Convert text into high-fidelity speech in real-time.
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
              Voice Model
            </label>
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-slate-400 text-sm cursor-not-allowed">
              Default Active Voice
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

        <button
          onClick={handleSynthesize}
          disabled={isLoading || !text}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              {streaming ? "Streaming speech..." : "Generating Audio..."}
            </span>
          ) : streaming ? (
            "Stream & Play Speech"
          ) : (
            "Synthesize Speech"
          )}
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm leading-relaxed">
            <span className="font-semibold block mb-1">Synthesis Failed</span>
            {error}
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
              Playing live stream from Aethex model...
            </span>
          </div>
        )}

        {audioUrl && (
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg flex flex-col gap-3 animate-fade-in">
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
