import { useSyncExternalStore } from "react";
import { toSaved, type LibraryData, type PlaylistInfo } from "@/lib/library";
import type { Track } from "@/lib/music";

type LibraryState = LibraryData & {
  ready: boolean;
  likedIds: Set<string>;
  menuTrack: Track | null;
  message: string | null;
};

const initialState: LibraryState = {
  ready: false,
  user: null,
  liked: [],
  likedIds: new Set(),
  playlists: [],
  menuTrack: null,
  message: null,
};

const MESSAGE_MS = 4000;

let state = initialState;
let loading: Promise<void> | null = null;
let messageTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function update(patch: Partial<LibraryState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function showMessage(message: string) {
  if (messageTimer) clearTimeout(messageTimer);
  messageTimer = setTimeout(() => update({ message: null }), MESSAGE_MS);
  update({ message });
}

function setLikedList(liked: Track[]) {
  update({ liked, likedIds: new Set(liked.map((track) => track.videoId)) });
}

async function send(path: string, method: string, body: unknown): Promise<Response> {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${method} ${path} failed: ${response.status}`);
  return response;
}

/** Loads the signed-in user's library, or reloads it after logging in or out. */
export function loadLibrary(): Promise<void> {
  loading = fetch("/api/library")
    .then((response) => response.json() as Promise<LibraryData>)
    .then(({ user, liked, playlists }) => {
      update({ user, playlists, ready: true });
      setLikedList(liked);
    })
    .catch(() => update({ ready: true }));
  return loading;
}

export function clearLibrary() {
  update({ user: null, playlists: [], menuTrack: null });
  setLikedList([]);
}

export async function setLiked(tracks: Track[], liked: boolean) {
  const previous = state.liked;
  const ids = new Set(tracks.map((track) => track.videoId));
  const others = previous.filter((track) => !ids.has(track.videoId));
  setLikedList(liked ? [...tracks, ...others] : others);

  try {
    if (liked) await send("/api/library/likes", "POST", { tracks: tracks.map(toSaved) });
    else await send("/api/library/likes", "DELETE", { videoIds: [...ids] });
  } catch {
    setLikedList(previous);
    showMessage("Couldn't update your likes");
  }
}

export async function createPlaylist(name: string): Promise<PlaylistInfo | null> {
  try {
    const response = await send("/api/library/playlists", "POST", { name });
    const playlist: PlaylistInfo = await response.json();
    update({ playlists: [playlist, ...state.playlists] });
    return playlist;
  } catch {
    showMessage("Couldn't create that playlist");
    return null;
  }
}

export async function addToPlaylist(playlist: PlaylistInfo, track: Track) {
  try {
    const path = `/api/library/playlists/${playlist.id}/tracks`;
    const response = await send(path, "POST", toSaved(track));
    const { added }: { added: boolean } = await response.json();
    if (added) {
      update({
        playlists: state.playlists.map((item) =>
          item.id === playlist.id ? { ...item, trackCount: item.trackCount + 1 } : item,
        ),
      });
    }
    showMessage(added ? `Added to ${playlist.name}` : `Already in ${playlist.name}`);
  } catch {
    showMessage("Couldn't add that song");
  }
}

/** Saves a play for signed-in users. Guests play without any record being kept. */
export async function recordPlay(track: Track) {
  await (loading ?? loadLibrary());
  if (!state.user) return;
  // History is a background detail, so a failed write never interrupts the music.
  send("/api/library/history", "POST", toSaved(track)).catch(() => {});
}

export const openTrackMenu = (track: Track) => update({ menuTrack: track });
export const closeTrackMenu = () => update({ menuTrack: null });

/** The login page's address, returning here afterwards. */
export function loginHref(): string {
  const { pathname, search } = window.location;
  return `/login?next=${encodeURIComponent(pathname + search)}`;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loading) void loadLibrary();
  return () => {
    listeners.delete(listener);
  };
}

export function useLibrary() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initialState,
  );
}
