"use client";

import { MoreIcon } from "@/components/icons";
import { usePlayer } from "@/components/player-provider";
import { artistNames } from "@/lib/format";
import { openTrackMenu } from "@/lib/library-store";
import type { Track } from "@/lib/music";

/**
 * Clicking a row plays it with the whole list as the queue. With `playsAlone`, the
 * rows are unrelated results, so the queue is built from radio instead.
 */
export function TrackList({ tracks, playsAlone = false }: { tracks: Track[]; playsAlone?: boolean }) {
  const { currentTrack, playTrack } = usePlayer();

  return (
    <ol className="flex flex-col gap-1">
      {tracks.map((track, index) => {
        const isCurrent = track.videoId === currentTrack?.videoId;
        return (
          <li key={`${track.videoId}-${index}`} className="flex items-center">
            <button
              type="button"
              onClick={() => playTrack(track, playsAlone ? undefined : tracks)}
              aria-current={isCurrent || undefined}
              className={`flex min-h-14 min-w-0 flex-1 items-center gap-4 rounded-2xl px-4 py-2 text-left active:shadow-pressed ${
                isCurrent ? "shadow-pressed" : ""
              }`}
            >
              <span className="w-6 shrink-0 text-right text-sm tabular-nums text-text-muted">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`track-title block truncate font-medium ${isCurrent ? "text-accent" : ""}`}
                >
                  {track.title ?? "Untitled"}
                </span>
                <span className="block truncate text-sm text-text-muted">
                  {artistNames(track.artists)}
                </span>
              </span>
              {track.duration && (
                <span className="shrink-0 text-xs tabular-nums text-text-muted">
                  {track.duration}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => openTrackMenu(track)}
              aria-label={`More options for ${track.title ?? "this song"}`}
              className="grid size-11 shrink-0 place-items-center rounded-full text-text-muted active:shadow-pressed"
            >
              <MoreIcon />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
