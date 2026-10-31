"use client";

import { useEffect, useState } from "react";
import { LoginPrompt } from "@/components/library-view";
import { LoadingCard, Notice } from "@/components/notice";
import { TrackList } from "@/components/track-list";
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

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{playlist.name}</h1>
      {playlist.tracks.length > 0 ? (
        <TrackList tracks={playlist.tracks} />
      ) : (
        <Notice title="No songs here yet">
          Use the menu next to any song to add it to this playlist.
        </Notice>
      )}
    </>
  );
}
