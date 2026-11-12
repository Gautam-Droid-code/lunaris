"use client";

import Link from "next/link";
import { usePlayer } from "@/components/player-provider";
import { Cover } from "@/components/cover";
import { LikeButton } from "@/components/like-button";
import { PlayIcon, PlusIcon, ShuffleIcon } from "@/components/icons";
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
  const isPlaylist = kind === "playlist";

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
          {(tracks.length > 0 || isPlaylist) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {tracks.length > 0 && (
                <>
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
                </>
              )}
              {isPlaylist && (
                <Link
                  href="/search"
                  aria-label="Add tracks"
                  title="Add tracks"
                  className="nm-nav-button nm-raised-sm grid size-11 place-items-center"
                >
                  <PlusIcon className="size-5 nm-strong" />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="min-w-0 flex-1">
        {tracks.length > 0 ? (
          <TrackList tracks={tracks} variant="chart" />
        ) : (
          <div className="nm-well nm-inset flex min-h-[160px] flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="font-medium nm-strong">No tracks here yet</p>
            {isPlaylist ? (
              <>
                <p className="max-w-xs text-xs nm-muted">
                  Find a song in search, then add it to this playlist from its menu.
                </p>
                <Link
                  href="/search"
                  className="nm-card nm-raised-sm inline-flex min-h-11 items-center gap-2 rounded-2xl px-5 text-sm font-medium nm-strong"
                >
                  <PlusIcon className="size-4" />
                  Add tracks
                </Link>
              </>
            ) : (
              <p className="max-w-xs text-xs nm-muted">
                Tracks will appear here when they&apos;re added.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
