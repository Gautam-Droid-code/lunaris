import type { PlayerBackend } from "@/lib/player-engine";

type AudioEvents = {
  onReady(backend: PlayerBackend): void;
  onState(code: number): void;
  onError(): void;
  onLoadFailure(): void;
};

const PLAYING = 1;
const PAUSED = 2;
const ENDED = 0;

/** Creates an <audio> element backend. Call once. */
export function createAudioBackend(element: HTMLElement, events: AudioEvents) {
  const audio = document.createElement("audio");
  audio.preload = "metadata";
  audio.crossOrigin = "anonymous";
  element.append(audio);

  const backend: PlayerBackend = {
    load: (videoId) => {
      audio.src = `/api/stream/${encodeURIComponent(videoId)}`;
      audio.load();
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.catch((err: unknown) => {
          // Autoplay blocked (no user gesture yet): leave paused; a tap will start it.
          if (err && (err as { name?: string }).name !== "NotAllowedError") {
            events.onError();
          }
        });
      }
    },
    play: () => {
      void audio.play().catch(() => events.onError());
    },
    pause: () => audio.pause(),
    seek: (seconds) => {
      try {
        audio.currentTime = seconds;
      } catch {
        // ignore
      }
    },
    setVolume: (volume) => {
      audio.volume = Math.min(1, Math.max(0, volume / 100));
    },
    time: () => audio.currentTime || 0,
    duration: () => (Number.isFinite(audio.duration) ? audio.duration : 0),
  };

  audio.addEventListener("play", () => events.onState(PLAYING));
  audio.addEventListener("pause", () => events.onState(PAUSED));
  audio.addEventListener("ended", () => events.onState(ENDED));
  audio.addEventListener("error", () => events.onError());

  // Connect immediately so the engine can load/play without waiting for metadata.
  events.onReady(backend);
}
