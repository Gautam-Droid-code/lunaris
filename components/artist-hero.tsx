"use client";

import { usePlayer } from "@/components/player-provider";
import { Cover } from "@/components/cover";
import { PlayIcon, ShuffleIcon } from "@/components/icons";
import type { Thumbnail, Track } from "@/lib/music";

export function ArtistHero({
  name,
  subtitle,
  thumbnails,
  tracks,
}: {
  name: string;
  subtitle: string | null;
  thumbnails: Thumbnail[];
  tracks: Track[];
}) {
  const { playTrack, shuffle, toggleShuffle } = usePlayer();

  return (
    <section className="nm-card nm-raised flex flex-col items-center gap-4 p-4 text-center md:flex-row md:items-center md:gap-6 md:text-left">
      <div className="nm-well nm-inset shrink-0 rounded-full p-1.5">
        <Cover
          thumbnails={thumbnails}
          alt={name}
          size={320}
          className="size-32 rounded-full md:size-40"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="nm-eyebrow">Artist</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight nm-strong md:text-3xl">
          {name}
        </h1>
        {subtitle && <p className="mt-1 text-sm nm-muted">{subtitle}</p>}
        {tracks.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <button
              type="button"
              onClick={() => playTrack(tracks[0], tracks)}
              aria-label="Play"
              className="nm-card nm-raised grid size-14 place-items-center rounded-full transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
            >
              <PlayIcon className="size-6 nm-strong" />
            </button>
            <button
              type="button"
              onClick={toggleShuffle}
              aria-pressed={shuffle}
              aria-label="Shuffle"
              className={`nm-nav-button nm-raised-sm grid size-11 place-items-center ${
                shuffle ? "nm-pressed-sm nm-accent" : ""
              }`}
            >
              <ShuffleIcon className="size-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
