"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cover } from "@/components/cover";
import { PlayButton } from "@/components/play-button";
import { PlayerSlot, usePlayer } from "@/components/player-provider";
import { artistNames } from "@/lib/format";

export function NowPlayingBar() {
  const pathname = usePathname();
  const { currentTrack: track, notice } = usePlayer();

  // The Now Playing screen holds the player itself.
  if (!track || pathname.startsWith("/now-playing")) return null;

  const artist = artistNames(track.artists);
  const title = track.title ?? "Untitled";

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-3xl bg-surface p-2 pr-3 shadow-raised-sm">
        <Link
          href={`/now-playing/${track.videoId}`}
          aria-label={`Open ${title} by ${artist}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl"
        >
          <PlayerSlot className="h-[54px] w-24 shrink-0 overflow-hidden rounded-2xl">
            <Cover thumbnails={track.thumbnails} alt="" size={192} className="size-full" />
          </PlayerSlot>
          <span className="min-w-0">
            <span className="track-title block truncate text-sm font-medium">{title}</span>
            <span role="status" className="block truncate text-xs text-text-muted">
              {notice ?? artist}
            </span>
          </span>
        </Link>
        <PlayButton className="grid size-11 shrink-0 place-items-center rounded-full bg-surface shadow-raised-sm active:shadow-pressed" />
      </div>
    </div>
  );
}
