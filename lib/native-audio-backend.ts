import type { PlayerBackend } from "@/lib/player-engine";
import { Capacitor } from "@capacitor/core";

type AudioEvents = {
  onReady(backend: PlayerBackend): void;
  onState(code: number): void;
  onError(): void;
  onLoadFailure(): void;
  onNext?(): void;
  onPrev?(): void;
};

const PLAYING = 1;
const PAUSED = 2;
const ENDED = 0;

type TrackMeta = {
  title?: string;
  artist?: string;
  album?: string;
  artworkUrl?: string;
};

let currentMeta: TrackMeta = {};
export function setNativeAudioMetadata(meta: TrackMeta) {
  currentMeta = meta;
}

function getPlugin(): any {
  return (Capacitor as any).Plugins?.CapacitorAudioPlayer;
}

/** Creates a native (Capacitor/ExoPlayer) backend. Call once. */
export function createNativeAudioBackend(element: HTMLElement, events: AudioEvents) {
  const plugin = getPlugin();
  if (!plugin) {
    events.onLoadFailure();
    return;
  }

  let cachedTime = 0;
  let cachedDuration = 0;

  const backend: PlayerBackend = {
    load: (videoId) => {
      const url = `${window.location.origin}/api/stream/${encodeURIComponent(videoId)}`;
      plugin
        .load({
          url,
          title: currentMeta.title ?? "",
          artist: currentMeta.artist ?? "",
          album: currentMeta.album ?? "",
          artworkUrl: currentMeta.artworkUrl ?? "",
        })
        .then(() => plugin.play())
        .catch(() => events.onError());
    },
    play: () => {
      void plugin.play().catch(() => events.onError());
    },
    pause: () => {
      void plugin.pause();
    },
    seek: (seconds) => {
      void plugin.seek({ seconds });
    },
    setVolume: (volume) => {
      void plugin.setVolume({ volume: Math.round(volume) });
    },
    time: () => cachedTime,
    duration: () => cachedDuration,
  };

  plugin.addListener("state", (data: any) => {
    const s = data?.state;
    if (s === "playing") events.onState(PLAYING);
    else if (s === "paused") events.onState(PAUSED);
    else if (s === "ended") events.onState(ENDED);
    else if (s === "error") events.onError();
  });
  plugin.addListener("next", () => events.onNext?.());
  plugin.addListener("prev", () => events.onPrev?.());
  plugin.addListener("time", (data: any) => {
    if (typeof data?.value === "number") cachedTime = data.value;
  });
  plugin.addListener("duration", (data: any) => {
    if (typeof data?.value === "number") cachedDuration = data.value;
  });
  plugin.addListener("error", () => events.onError());

  const poll = window.setInterval(() => {
    plugin
      .getCurrentTime()
      .then((r: any) => {
        if (typeof r?.value === "number") cachedTime = r.value;
      })
      .catch(() => {});
    plugin
      .getDuration()
      .then((r: any) => {
        if (typeof r?.value === "number") cachedDuration = r.value;
      })
      .catch(() => {});
  }, 500);

  // keep element reference to avoid unused; no DOM node needed
  void element;

  events.onReady(backend);

  // store cleanup on element for potential unmount
  (element as any).__nativePoll = poll;
}
