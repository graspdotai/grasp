const PCM_SAMPLE_RATE = 24_000;

export class Pcm16StreamPlayer {
  private audioContext: AudioContext | null = null;
  private scheduledTime = 0;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported in this browser.");
      }
      this.audioContext = new AudioContextClass({ sampleRate: PCM_SAMPLE_RATE });
      this.scheduledTime = this.audioContext.currentTime;
    }

    return this.audioContext;
  }

  public async playStream(stream: ReadableStream<Uint8Array>): Promise<void> {
    const reader = stream.getReader();
    const audioContext = this.getAudioContext();
    let leftOverBuffer: Uint8Array | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;

        let chunk = value;
        if (leftOverBuffer) {
          const combined = new Uint8Array(leftOverBuffer.length + value.length);
          combined.set(leftOverBuffer);
          combined.set(value, leftOverBuffer.length);
          chunk = combined;
          leftOverBuffer = null;
        }

        const numSamples = Math.floor(chunk.length / 2);
        if (chunk.length % 2 !== 0) {
          leftOverBuffer = chunk.slice(chunk.length - 1);
        }
        if (numSamples === 0) continue;

        const floatData = new Float32Array(numSamples);
        const dataView = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        for (let i = 0; i < numSamples; i += 1) {
          floatData[i] = dataView.getInt16(i * 2, true) / 32768;
        }

        const audioBuffer = audioContext.createBuffer(1, numSamples, PCM_SAMPLE_RATE);
        audioBuffer.getChannelData(0).set(floatData);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        const startPlayTime = Math.max(this.scheduledTime, audioContext.currentTime);
        source.start(startPlayTime);
        this.scheduledTime = startPlayTime + audioBuffer.duration;
      }
    } finally {
      reader.releaseLock();
    }
  }

  public async stop(): Promise<void> {
    if (!this.audioContext) return;
    await this.audioContext.close();
    this.audioContext = null;
    this.scheduledTime = 0;
  }
}
