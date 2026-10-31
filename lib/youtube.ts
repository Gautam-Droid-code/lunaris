import type { PlayerBackend } from "@/lib/player-engine";

const API_URL = "https://www.youtube.com/iframe_api";

type YouTubePlayer = {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
  getDuration(): number;
};

type YouTubeEvent = { target: YouTubePlayer; data: number };

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      width: string;
      height: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady(event: YouTubeEvent): void;
        onStateChange(event: YouTubeEvent): void;
        onError(event: YouTubeEvent): void;
      };
    },
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let api: Promise<YouTubeNamespace> | null = null;

/** Adds the IFrame API script once and resolves when it is ready. */
function loadApi(): Promise<YouTubeNamespace> {
  api ??= new Promise((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT!);
    const script = document.createElement("script");
    script.src = API_URL;
    script.onerror = () => reject(new Error("YouTube IFrame API failed to load"));
    document.head.append(script);
  });
  return api;
}

type YouTubeEvents = {
  onReady(backend: PlayerBackend): void;
  onState(code: number): void;
  onError(): void;
  onLoadFailure(): void;
};

/** Creates the YouTube player in place of `element`. Call this only once. */
export function createYouTubePlayer(element: HTMLElement, events: YouTubeEvents) {
  loadApi().then(
    (YT) =>
      new YT.Player(element, {
        width: "100%",
        height: "100%",
        playerVars: { playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: ({ target }) =>
            events.onReady({
              load: (videoId) => target.loadVideoById(videoId),
              play: () => target.playVideo(),
              pause: () => target.pauseVideo(),
              seek: (seconds) => target.seekTo(seconds, true),
              setVolume: (volume) => target.setVolume(volume),
              time: () => target.getCurrentTime(),
              duration: () => target.getDuration(),
            }),
          onStateChange: ({ data }) => events.onState(data),
          onError: () => events.onError(),
        },
      }),
    () => events.onLoadFailure(),
  );
}
