"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cover } from "@/components/cover";
import { QueueIcon } from "@/components/icons";
import { PlayButton } from "@/components/play-button";
import { PlayerSlot, usePlayer } from "@/components/player-provider";
import { useRoomSyncState } from "@/components/room-sync-provider";
import { useCurrentRoom } from "@/lib/room-store";
import { artistNames } from "@/lib/format";

export function NowPlayingBar() {
  const pathname = usePathname();
  const { currentTrack: track, notice } = usePlayer();
  const { needsTap, unlock, isLeader } = useRoomSyncState();
  const { room } = useCurrentRoom();
  const isFollower = !!room && !isLeader;

  // The Now Playing screen holds the player itself.
  if (!track || pathname.startsWith("/now-playing")) return null;

  const artist = artistNames(track.artists);
  const title = track.title ?? "Untitled";

  const tapToJoin = needsTap && !!track;

  return (
    <div className="fixed inset-x-0 bottom-16 z-10 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] lg:bottom-0">
      <div
        className={`nm-mini-player nm-raised-sm mx-auto flex max-w-2xl items-center gap-2 p-2 pr-3 ${
          tapToJoin ? "nm-accent" : ""
        }`}
        onClick={tapToJoin ? unlock : undefined}
        role={tapToJoin ? "button" : undefined}
        aria-label={tapToJoin ? "Tap to join the session" : undefined}
      >
        <Link
          href={tapToJoin ? "#" : `/now-playing/${track.videoId}`}
          aria-label={`Open ${title} by ${artist}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl"
          onClick={tapToJoin ? (e) => e.preventDefault() : undefined}
        >
          <div className="nm-mini-thumb nm-inset-sm shrink-0">
            <PlayerSlot className="h-[54px] w-24 overflow-hidden rounded-[13px]">
              <Cover thumbnails={track.thumbnails} alt="" size={192} className="size-full" />
            </PlayerSlot>
          </div>
          <span className="min-w-0">
            <span className="nm-mini-title track-title block truncate text-sm font-medium">
              {title}
            </span>
            <span role="status" className="nm-mini-subtitle block truncate text-xs">
              {tapToJoin
                ? "Tap to join the group session"
                : isFollower
                  ? "Listening in sync"
                  : notice ?? artist}
            </span>
          </span>
        </Link>
        <Link
          href="/queue"
          aria-label="Queue"
          className="nm-nav-button nm-raised-sm grid size-9 shrink-0 place-items-center"
        >
          <QueueIcon className="size-4" />
        </Link>
        {!isFollower && (
          <PlayButton className="nm-mini-play nm-raised-sm grid size-11 shrink-0 place-items-center" />
        )}
      </div>
    </div>
  );
}
