"use client";

import { usePlayer } from "@/components/player-provider";
import { Cover } from "@/components/cover";
import { LikeButton } from "@/components/like-button";
import { PlayIcon, ShuffleIcon } from "@/components/icons";
import { TrackList } from "@/components/track-list";
import type { Thumbnail, Track } from "@/lib/music";

export function CollectionView({
  kind,
  title,
  subtitle,
  thumbnails,
  tracks,
}: {
  kind: "album" | "playlist";
  title: string;
  subtitle: string;
  thumbnails: Thumbnail[];
  tracks: Track[];
}) {
  const { playTrack, shuffle, toggleShuffle } = usePlayer();

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <section className="nm-card nm-raised flex flex-col gap-5 p-4 lg:w-80 lg:shrink-0">
        <div className="nm-well nm-inset shrink-0 p-1.5">
          <Cover
            thumbnails={thumbnails}
            alt={`${title} cover`}
            size={320}
            className="aspect-square w-full rounded-[14px]"
          />
        </div>
        <div className="min-w-0">
          <p className="nm-eyebrow">{kind === "album" ? "Album" : "Playlist"}</p>
          <h1 className="mt-1 line-clamp-2 text-2xl font-semibold tracking-tight nm-strong">
            {title}
          </h1>
          <p className="mt-1 truncate text-sm nm-muted">{subtitle}</p>
          {tracks.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
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
              <LikeButton tracks={tracks} label={`Like all songs in this ${kind}`} />
            </div>
          )}
        </div>
      </section>

      <div className="min-w-0 flex-1">
        {tracks.length > 0 ? (
          <TrackList tracks={tracks} variant="chart" />
        ) : (
          <div className="nm-well nm-inset flex min-h-[160px] flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="font-medium nm-strong">No tracks here yet</p>
            <p className="max-w-xs text-xs nm-muted">
              Tracks will appear here when they&apos;re added.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
