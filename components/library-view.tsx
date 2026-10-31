"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signOut } from "@/app/login/actions";
import { LoadingCard, Notice } from "@/components/notice";
import { TrackList } from "@/components/track-list";
import { clearLibrary, createPlaylist, useLibrary } from "@/lib/library-store";

export function LoginPrompt({ next }: { next: string }) {
  return (
    <Notice title="Log in to see your library">
      <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent underline">
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
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-label="New playlist name"
        placeholder="New playlist"
        maxLength={100}
        className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-3 shadow-pressed outline-none placeholder:text-text-muted"
      />
      <button
        type="submit"
        className="rounded-2xl bg-surface px-5 py-3 font-medium shadow-raised-sm active:shadow-pressed"
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

  if (!ready) return <LoadingCard label="Loading your library…" />;
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
          <h1 className="text-2xl font-semibold tracking-tight">Your library</h1>
          <p className="truncate text-sm text-text-muted">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={logOut}
          disabled={signingOut}
          className="shrink-0 rounded-2xl bg-surface px-4 py-2 text-sm font-medium shadow-raised-sm active:shadow-pressed disabled:opacity-60"
        >
          Log out
        </button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Playlists</h2>
        <NewPlaylistForm />
        {playlists.length > 0 && (
          <ul className="flex flex-col gap-1">
            {playlists.map((playlist) => (
              <li key={playlist.id}>
                <Link
                  href={`/library/playlists/${playlist.id}`}
                  className="flex min-h-14 items-center justify-between gap-4 rounded-2xl px-4 py-2 active:shadow-pressed"
                >
                  <span className="truncate font-medium">{playlist.name}</span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {playlist.trackCount} {playlist.trackCount === 1 ? "song" : "songs"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Liked songs</h2>
        {liked.length > 0 ? (
          <TrackList tracks={liked} />
        ) : (
          <Notice title="No liked songs yet">Tap the heart on a song to save it here.</Notice>
        )}
      </section>
    </>
  );
}
