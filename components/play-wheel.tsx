"use client";

import Link from "next/link";
import { ListIcon, NextIcon, PrevIcon, ShuffleIcon } from "@/components/icons";
import { PlayButton } from "@/components/play-button";
import { usePlayer } from "@/components/player-provider";

const ringButton =
  "absolute grid size-12 place-items-center rounded-full active:shadow-pressed";

export function PlayWheel() {
  const { currentTrack, shuffle, toggleShuffle, next, prev } = usePlayer();

  return (
    <div className="relative size-60 rounded-full bg-surface shadow-raised sm:size-64">
      <button
        type="button"
        onClick={toggleShuffle}
        aria-label="Shuffle"
        aria-pressed={shuffle}
        className={`${ringButton} left-1/2 top-2 -translate-x-1/2 ${
          shuffle ? "text-accent" : "text-text-muted"
        }`}
      >
        <ShuffleIcon />
      </button>
      <button
        type="button"
        onClick={prev}
        disabled={!currentTrack}
        aria-label="Previous track"
        className={`${ringButton} left-2 top-1/2 -translate-y-1/2`}
      >
        <PrevIcon />
      </button>
      <button
        type="button"
        onClick={next}
        disabled={!currentTrack}
        aria-label="Next track"
        className={`${ringButton} right-2 top-1/2 -translate-y-1/2`}
      >
        <NextIcon />
      </button>
      <Link
        href="/"
        aria-label="Back to home"
        className={`${ringButton} bottom-2 left-1/2 -translate-x-1/2 text-text-muted`}
      >
        <ListIcon />
      </Link>
      <PlayButton
        className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-surface shadow-raised-sm active:shadow-pressed"
        iconClassName="size-8"
      />
    </div>
  );
}
