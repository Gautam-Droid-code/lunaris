"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Cover } from "@/components/cover";
import { CheckIcon, MoreIcon, PlayIcon, PlusIcon } from "@/components/icons";
import { useCurrentRoom } from "@/lib/room-store";
import { artUrl } from "@/lib/format";
import { usePlayer } from "@/components/player-provider";
import { artistNames } from "@/lib/format";
import { openTrackMenu } from "@/lib/library-store";
import type { Track } from "@/lib/music";

/**
 * Clicking a row plays it with the whole list as the queue. With `playsAlone`, the
 * rows are unrelated results, so the queue is built from radio instead.
 *
 * `variant="neumorphic"` opts into the flat/hover/pressed song rows used by the
 * search screen. `variant="chart"` reuses those rows for the home chart and adds
 * the rank and a raised more-options control. The default keeps every other
 * screen's row styling untouched.
 */
export function TrackList({
  tracks,
  playsAlone = false,
  variant = "default",
  showAddToGroup = false,
}: {
  tracks: Track[];
  playsAlone?: boolean;
  variant?: "default" | "neumorphic" | "chart";
  showAddToGroup?: boolean;
}) {
  const { currentTrack, playTrack } = usePlayer();
  const { room } = useCurrentRoom();
  const listRef = useRef<HTMLOListElement>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  async function addToGroup(track: Track) {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.id}/playlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: track.videoId,
          title: track.title ?? "Untitled",
          artists: track.artists,
          thumbnail: artUrl(track.thumbnails, 320),
        }),
      });
      setAdded((prev) => new Set(prev).add(track.videoId));
    } catch {
      // ignore
    }
  }
  const chart = variant === "chart";

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rows = listRef.current?.querySelectorAll(":scope > li");
      if (rows && rows.length) {
        gsap.from(rows, {
          y: 16,
          opacity: 0,
          stagger: 0.06,
          ease: "power3.out",
          duration: 0.4,
          clearProps: "all",
        });
      }
    },
    { scope: listRef, dependencies: [tracks.length] },
  );
  const neumorphic = variant === "neumorphic";
  const softRows = chart || neumorphic;

  return (
    <ol ref={listRef} className={neumorphic ? "flex flex-col gap-2" : "flex flex-col gap-1"}>
      {tracks.map((track, index) => {
        const isCurrent = track.videoId === currentTrack?.videoId;
        return (
          <li
            key={`${track.videoId}-${index}`}
            className={softRows ? "flex items-center gap-1" : "flex items-center"}
          >
            <button
              type="button"
              onClick={() => playTrack(track, playsAlone ? undefined : tracks)}
              aria-current={isCurrent || undefined}
              className={
                softRows
                  ? "nm-row nm-song-row min-w-0 flex-1"
                  : `flex min-h-14 min-w-0 flex-1 items-center gap-4 rounded-2xl px-4 py-2 text-left active:shadow-pressed ${
                      isCurrent ? "shadow-pressed" : ""
                    }`
              }
            >
              {softRows ? (
                <>
                  {chart && (
                    <span className="w-6 shrink-0 text-right text-sm tabular-nums nm-muted">
                      {index + 1}
                    </span>
                  )}
                  <span className="nm-thumb nm-inset-sm block shrink-0 p-[2px]">
                    <Cover
                      thumbnails={track.thumbnails}
                      alt=""
                      size={96}
                      className="size-11 rounded-[10px]"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm font-semibold ${
                        isCurrent ? "nm-accent" : "nm-strong"
                      }`}
                    >
                      {track.title ?? "Untitled"}
                    </span>
                    <span className="mt-0.5 block truncate text-xs nm-muted">
                      {artistNames(track.artists)}
                    </span>
                  </span>
                  {track.duration && (
                    <span className="shrink-0 text-xs tabular-nums nm-muted">
                      {track.duration}
                    </span>
                  )}
                  {!chart && (
                    <span
                      aria-hidden="true"
                      className="nm-row-play nm-inset grid size-8 shrink-0 place-items-center"
                    >
                      <PlayIcon className="size-3.5" />
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="w-6 shrink-0 text-right text-sm tabular-nums text-text-muted">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`track-title block truncate font-medium ${
                        isCurrent ? "text-accent" : ""
                      }`}
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
                </>
              )}
            </button>
            {showAddToGroup && room && (
              <button
                type="button"
                onClick={() => addToGroup(track)}
                aria-label={`Add ${track.title ?? "this song"} to group room`}
                className="nm-nav-button nm-raised-sm grid size-10 shrink-0 place-items-center"
              >
                {added.has(track.videoId) ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <PlusIcon className="size-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => openTrackMenu(track)}
              aria-label={`More options for ${track.title ?? "this song"}`}
              className={
                chart
                  ? "nm-nav-button nm-raised-sm grid size-10 shrink-0 place-items-center"
                  : neumorphic
                    ? "nm-nav-button grid size-10 shrink-0 place-items-center"
                    : "grid size-11 shrink-0 place-items-center rounded-full text-text-muted active:shadow-pressed"
              }
            >
              <MoreIcon className={chart ? "size-4" : undefined} />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
