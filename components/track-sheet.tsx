"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  addToPlaylist,
  closeTrackMenu,
  createPlaylist,
  loginHref,
  setLiked,
  useLibrary,
} from "@/lib/library-store";
import { HeartIcon } from "@/components/icons";
import { artistNames } from "@/lib/format";
import type { PlaylistInfo } from "@/lib/library";
import type { Track } from "@/lib/music";

const sheetButton =
  "flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-2 text-left active:shadow-pressed";

function SavedActions({ track }: { track: Track }) {
  const { likedIds, playlists } = useLibrary();
  const [name, setName] = useState("");
  const liked = likedIds.has(track.videoId);

  function add(playlist: PlaylistInfo) {
    closeTrackMenu();
    void addToPlaylist(playlist, track);
  }

  async function createAndAdd(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    closeTrackMenu();
    const playlist = await createPlaylist(trimmed);
    if (playlist) await addToPlaylist(playlist, track);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLiked([track], !liked)}
        aria-pressed={liked}
        className={`${sheetButton} ${liked ? "text-accent" : ""}`}
      >
        <HeartIcon filled={liked} />
        {liked ? "Liked" : "Like"}
      </button>

      <h3 className="mt-3 px-4 text-sm font-medium text-text-muted">Add to playlist</h3>
      <ul className="max-h-52 overflow-y-auto">
        {playlists.map((playlist) => (
          <li key={playlist.id}>
            <button type="button" onClick={() => add(playlist)} className={sheetButton}>
              <span className="truncate">{playlist.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={createAndAdd} className="mt-2 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label="New playlist name"
          placeholder="New playlist"
          maxLength={100}
          className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-2 shadow-pressed outline-none placeholder:text-text-muted"
        />
        <button
          type="submit"
          className="rounded-2xl bg-surface px-4 py-2 font-medium shadow-raised-sm active:shadow-pressed"
        >
          Create
        </button>
      </form>
    </>
  );
}

/** The one options sheet for tracks, opened from any list or the Now Playing screen. */
export function TrackSheet() {
  const { ready, user, menuTrack, message } = useLibrary();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (menuTrack && !dialog?.open) dialog?.showModal();
    if (!menuTrack && dialog?.open) dialog.close();
  }, [menuTrack]);

  return (
    <>
      <dialog
        ref={dialogRef}
        onClose={closeTrackMenu}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeTrackMenu();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-surface p-4 text-text shadow-raised backdrop:bg-black/40"
      >
        {menuTrack && (
          <div key={menuTrack.videoId}>
            <div className="mb-3 px-4">
              <h2 className="track-title truncate font-semibold">
                {menuTrack.title ?? "Untitled"}
              </h2>
              <p className="truncate text-sm text-text-muted">{artistNames(menuTrack.artists)}</p>
            </div>
            {user ? (
              <SavedActions track={menuTrack} />
            ) : (
              ready && (
                <Link href={loginHref()} onClick={closeTrackMenu} className={sheetButton}>
                  Log in to like songs and build playlists
                </Link>
              )
            )}
          </div>
        )}
      </dialog>
      {message && (
        <p
          role="status"
          className="fixed inset-x-4 top-4 z-30 mx-auto max-w-sm rounded-2xl bg-surface p-3 text-center text-sm shadow-raised"
        >
          {message}
        </p>
      )}
    </>
  );
}
