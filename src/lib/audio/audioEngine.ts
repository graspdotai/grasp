import { Pcm16StreamPlayer } from "./pcm16StreamPlayer";

type SynthesisProvider = "aethex" | "browser";
type SynthesisMode = "stream" | "file" | "fallback";

export interface SynthesizeInput {
  text: string;
  language: string;
  streaming: boolean;
}

export interface SynthesizeResult {
  mode: SynthesisMode;
  provider: SynthesisProvider;
  usedFallback: boolean;
  audioUrl: string | null;
  warning: string | null;
}

interface SynthesizeOptions {
  onStreamStateChange?: (isPlaying: boolean) => void;
}

const AETHEX_TTS_URL = "/api/aethex/tts";

export class AudioEngine {
  private readonly streamPlayer = new Pcm16StreamPlayer();

  public async synthesize(input: SynthesizeInput, options?: SynthesizeOptions): Promise<SynthesizeResult> {
    try {
      const response = await fetch(AETHEX_TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(await this.extractError(response));
      }

      if (input.streaming) {
        if (!response.body) {
          throw new Error("Aethex did not return a stream body.");
        }
        options?.onStreamStateChange?.(true);
        await this.streamPlayer.playStream(response.body);
        options?.onStreamStateChange?.(false);
        return {
          mode: "stream",
          provider: "aethex",
          usedFallback: false,
          audioUrl: null,
          warning: null,
        };
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return {
        mode: "file",
        provider: "aethex",
        usedFallback: false,
        audioUrl,
        warning: null,
      };
    } catch (error) {
      options?.onStreamStateChange?.(false);
      await this.streamPlayer.stop();
      await this.speakWithBrowserVoice(input.text, input.language);
      return {
        mode: "fallback",
        provider: "browser",
        usedFallback: true,
        audioUrl: null,
        warning: `Aethex unavailable. Using browser speech fallback. ${this.getErrorMessage(error)}`,
      };
    }
  }

  public async stop(): Promise<void> {
    await this.streamPlayer.stop();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  private async speakWithBrowserVoice(text: string, language: string): Promise<void> {
    if (!("speechSynthesis" in window)) {
      throw new Error("Browser speech synthesis is not supported.");
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language.toLowerCase().startsWith("fr") ? "fr-FR" : "en-US";

    await new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error("Browser speech synthesis failed."));
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  private async extractError(response: Response): Promise<string> {
    try {
      const data = (await response.json()) as { error?: string };
      return data.error ?? `Aethex request failed with status ${response.status}`;
    } catch {
      return `Aethex request failed with status ${response.status}`;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Unknown error";
  }
}
