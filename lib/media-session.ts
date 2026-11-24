"use client";

import type { createPlayer } from "@/lib/player-engine";

type Player = ReturnType<typeof createPlayer>;

export function connectMediaSession(player: Player): () => void {
  if (typeof window === "undefined" || !("mediaSession" in navigator)) {
    return () => {};
  }
  const mediaSession = navigator.mediaSession;

  const safe = (fn: () => void) => {
    try {
      fn();
    } catch {
      // ignore
    }
  };

  mediaSession.setActionHandler("play", () => {
    if (!player.getState().isPlaying) player.togglePlay();
  });
  mediaSession.setActionHandler("pause", () => {
    if (player.getState().isPlaying) player.togglePlay();
  });
  mediaSession.setActionHandler("previoustrack", () => player.prev());
  mediaSession.setActionHandler("nexttrack", () => player.next());
  mediaSession.setActionHandler("seekto", (details) => {
    if (details?.seekTime != null) player.seek(details.seekTime);
  });
  mediaSession.setActionHandler("seekbackward", (details) => {
    const state = player.getState();
    player.seek(Math.max(0, state.currentTime - (details?.seekOffset ?? 10)));
  });
  mediaSession.setActionHandler("seekforward", (details) => {
    const state = player.getState();
    player.seek(state.currentTime + (details?.seekOffset ?? 10));
  });

  function update() {
    const state = player.getState();
    const track = state.currentTrack;
    if (!track) {
      safe(() => {
        mediaSession.metadata = null;
        mediaSession.playbackState = "none";
      });
      return;
    }
    safe(() => {
      mediaSession.metadata = new MediaMetadata({
        title: track.title ?? "",
        artist: (track.artists ?? [])
          .map((a) => a.name ?? "")
          .filter(Boolean)
          .join(", "),
        album: track.album?.name ?? "",
        artwork: (track.thumbnails ?? [])
          .filter((t) => t.url)
          .map((t) => ({
            src: t.url,
            sizes: t.width && t.height ? `${t.width}x${t.height}` : "",
            type: "image/jpeg",
          })),
      });
      mediaSession.playbackState = state.isPlaying ? "playing" : "paused";
      if (state.duration && state.duration > 0) {
        mediaSession.setPositionState({
          duration: state.duration,
          playbackRate: 1,
          position: Math.min(state.currentTime, state.duration),
        });
      }
    });
  }

  const unsubscribe = player.subscribe(update);
  update();
  return unsubscribe;
}
