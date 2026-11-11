"use client";

import Link from "next/link";
import { usePlayer } from "@/components/player-provider";
import { Cover } from "@/components/cover";
import { PlayIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { artistNames } from "@/lib/format";
import { getCharts } from "@/lib/music";
import type { Track } from "@/lib/music";

type Charts = NonNullable<Awaited<ReturnType<typeof getCharts>>>;

export function WelcomeView({
  charts,
  tracks,
}: {
  charts: Charts | null;
  tracks: Track[];
}) {
  const { playTrack } = usePlayer();
  const topSongs = tracks.slice(0, 6);
  const topArtists = charts?.artists?.slice(0, 8) ?? [];

  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex flex-col gap-6 pb-24 pt-5">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <Logo variant="full" size={28} />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm nm-link">
              Log in
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero */}
        <section className="nm-card nm-raised p-6 md:p-10">
          <p className="nm-eyebrow">Welcome</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight nm-strong md:text-6xl">
            Your nights, scored.
          </h1>
          <p className="mt-3 max-w-lg text-sm nm-muted md:text-base">
            {/* Editable copy: replace with your tagline. */}
            A soft, moonlit place for the music you love.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/browse"
              className="nm-card nm-raised-sm inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--nm-accent)] px-6 text-sm font-semibold text-white active:scale-[0.98] active:shadow-pressed"
            >
              Start listening
            </Link>
            <Link
              href="/login"
              className="nm-card nm-raised-sm inline-flex min-h-12 items-center justify-center rounded-2xl px-6 text-sm font-medium nm-strong"
            >
              Log in
            </Link>
          </div>
        </section>

        {/* Top tracks */}
        {topSongs.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight nm-strong">Top tracks</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topSongs.map((track) => (
                <button
                  key={track.videoId}
                  type="button"
                  onClick={() => playTrack(track, topSongs)}
                  className="nm-card nm-raised-sm flex items-center gap-3 rounded-2xl p-3 text-left transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <span className="nm-thumb nm-inset-sm block shrink-0 p-[2px]">
                    <Cover
                      thumbnails={track.thumbnails}
                      alt=""
                      size={96}
                      className="size-12 rounded-[8px]"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold nm-strong">
                      {track.title ?? "Untitled"}
                    </span>
                    <span className="block truncate text-xs nm-muted">
                      {artistNames(track.artists)}
                    </span>
                  </span>
                  <span className="nm-inset grid size-8 shrink-0 place-items-center rounded-full">
                    <PlayIcon className="size-3.5 nm-accent" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Trending artists */}
        {topArtists.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight nm-strong">Trending artists</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {topArtists.map((artist, i) => (
                <Link
                  key={artist.id ?? i}
                  href={artist.id ? `/artist/${artist.id}` : "#"}
                  className="nm-card nm-raised-sm flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <span className="nm-thumb nm-inset-sm block rounded-full p-[2px]">
                    <Cover
                      thumbnails={artist.thumbnails}
                      alt={artist.name ?? ""}
                      size={96}
                      className="size-16 rounded-full"
                    />
                  </span>
                  <span className="block truncate text-xs font-medium nm-strong">
                    {artist.name ?? "Unknown"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
