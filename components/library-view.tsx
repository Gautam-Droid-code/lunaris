"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signOut } from "@/app/login/actions";
import { Cover } from "@/components/cover";
import { HeartIcon } from "@/components/icons";
import { Notice } from "@/components/notice";
import { TrackList } from "@/components/track-list";
import { clearLibrary, createPlaylist, useLibrary } from "@/lib/library-store";

export function LoginPrompt({ next }: { next: string }) {
  return (
    <Notice variant="neumorphic" title="Log in to see your library">
      <Link href={`/login?next=${encodeURIComponent(next)}`} className="nm-link">
        Log in or create an account
      </Link>{" "}
      to keep liked songs and playlists. You can still browse and play without one.
    </Notice>
  );
}

function NewPlaylistForm() {
  const [name, setName] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed && (await createPlaylist(trimmed))) setName("");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <span className="nm-card nm-inset flex min-h-12 flex-1 items-center rounded-2xl px-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label="New playlist name"
          placeholder="New playlist"
          maxLength={100}
          className="nm-search-input"
        />
      </span>
      <button
        type="submit"
        className="nm-card nm-raised-sm rounded-2xl px-5 py-3 text-sm font-medium nm-strong disabled:opacity-60"
      >
        Create
      </button>
    </form>
  );
}

export function LibraryView() {
  const router = useRouter();
  const { ready, user, liked, playlists } = useLibrary();
  const [signingOut, startSignOut] = useTransition();

  if (!ready)
    return (
      <div className="flex flex-col gap-3">
        <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
        <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
        <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
      </div>
    );
  if (!user) return <LoginPrompt next="/library" />;

  function logOut() {
    startSignOut(async () => {
      await signOut();
      clearLibrary();
      router.push("/");
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight nm-strong">Your library</h1>
          <p className="truncate text-sm nm-muted">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={logOut}
          disabled={signingOut}
          className="nm-card nm-raised-sm rounded-2xl px-4 py-2 text-sm font-medium nm-strong disabled:opacity-60"
        >
          Log out
        </button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight nm-strong">Playlists</h2>
        <NewPlaylistForm />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <a
            href="#liked-songs"
            className="nm-card nm-raised-sm flex flex-col gap-3 p-4 transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
          >
            <span className="nm-inset grid aspect-square w-full place-items-center rounded-2xl">
              <HeartIcon filled className="size-10 nm-accent" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold nm-strong">Liked songs</span>
              <span className="block text-xs nm-muted">
                {liked.length} {liked.length === 1 ? "song" : "songs"}
              </span>
            </span>
          </a>
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/library/playlists/${playlist.id}`}
              className="nm-card nm-raised-sm flex flex-col gap-3 p-4 transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
            >
              <span className="nm-inset grid aspect-square w-full place-items-center rounded-2xl">
                <Cover thumbnails={[]} alt="" size={96} className="size-full rounded-[10px]" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold nm-strong">{playlist.name}</span>
                <span className="block text-xs nm-muted">
                  {playlist.trackCount} {playlist.trackCount === 1 ? "song" : "songs"}
                </span>
              </span>
            </Link>
          ))}
        </div>
        {playlists.length === 0 && (
          <Notice variant="neumorphic" title="No playlists yet">
            Create one above to start collecting songs.
          </Notice>
        )}
      </section>

      <section id="liked-songs" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight nm-strong">Liked songs</h2>
        {liked.length > 0 ? (
          <TrackList tracks={liked} variant="chart" />
        ) : (
          <Notice variant="neumorphic" title="No liked songs yet">
            Tap the heart on a song to save it here.
          </Notice>
        )}
      </section>
    </>
  );
}
