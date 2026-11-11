"use client";

import { useEffect, useState } from "react";
import { CollectionView } from "@/components/collection-view";
import { LoginPrompt } from "@/components/library-view";
import { LoadingCard, Notice } from "@/components/notice";
import { clockTime } from "@/lib/format";
import { useLibrary } from "@/lib/library-store";
import type { Track } from "@/lib/music";

type Loaded = { name: string; tracks: Track[] };

export function SavedPlaylist({ id }: { id: string }) {
  const { ready, user, playlists } = useLibrary();
  const [playlist, setPlaylist] = useState<Loaded | "failed" | "missing" | null>(null);
  const email = user?.email;
  const trackCount = playlists.find((item) => item.id === id)?.trackCount;

  // Reloads when a song is added, because this page stays alive across navigation.
  useEffect(() => {
    if (!email) return;
    const controller = new AbortController();
    fetch(`/api/library/playlists/${id}`, { signal: controller.signal })
      .then((response) => {
        if (response.status === 404) return "missing";
        return response.ok ? response.json() : "failed";
      })
      .then(setPlaylist)
      .catch(() => {
        if (!controller.signal.aborted) setPlaylist("failed");
      });
    return () => controller.abort();
  }, [id, email, trackCount]);

  if (ready && !user) return <LoginPrompt next={`/library/playlists/${id}`} />;
  if (!ready || playlist === null) return <LoadingCard label="Loading playlist…" />;
  if (playlist === "failed") return <Notice title="This playlist didn't load. Try again." />;
  if (playlist === "missing") return <Notice title="We couldn't find that playlist" />;

  const thumbnails = playlist.tracks[0]?.thumbnails ?? [];
  const totalSeconds = playlist.tracks.reduce(
    (sum, track) => sum + (track.durationSeconds ?? 0),
    0,
  );
  const subtitle = [
    `${playlist.tracks.length} ${playlist.tracks.length === 1 ? "song" : "songs"}`,
    totalSeconds > 0 ? clockTime(totalSeconds) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <CollectionView
      kind="playlist"
      title={playlist.name}
      subtitle={subtitle || "0 songs"}
      thumbnails={thumbnails}
      tracks={playlist.tracks}
    />
  );
}
