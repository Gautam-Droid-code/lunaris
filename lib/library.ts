import { artUrl } from "@/lib/format";
import type { ArtistRef, Track } from "@/lib/music";

/** The columns a saved track shares across the library tables. */
export type SavedTrack = {
  video_id: string;
  title: string;
  artists: ArtistRef[];
  thumbnail: string | null;
};

export type PlaylistInfo = { id: string; name: string; trackCount: number };

export type LibraryData = {
  user: { email: string } | null;
  liked: Track[];
  playlists: PlaylistInfo[];
};

const THUMBNAIL_SIZE = 320;

export function toSaved(track: Track): SavedTrack {
  return {
    video_id: track.videoId,
    title: track.title ?? "Untitled",
    artists: track.artists,
    thumbnail: artUrl(track.thumbnails, THUMBNAIL_SIZE),
  };
}

export function toTrack(saved: SavedTrack): Track {
  return {
    id: saved.video_id,
    videoId: saved.video_id,
    title: saved.title,
    artists: saved.artists ?? [],
    album: null,
    duration: null,
    durationSeconds: null,
    thumbnails: saved.thumbnail ? [{ url: saved.thumbnail, width: null, height: null }] : [],
    isExplicit: null,
  };
}

/** Validates a track sent by the browser, keeping only the expected fields. */
export function parseSavedTrack(value: unknown): SavedTrack | null {
  if (typeof value !== "object" || value === null) return null;
  const { video_id, title, artists, thumbnail } = value as Record<string, unknown>;

  if (typeof video_id !== "string" || !/^[\w-]{1,64}$/.test(video_id)) return null;
  if (typeof title !== "string" || title.length > 500) return null;
  if (thumbnail !== null && (typeof thumbnail !== "string" || !thumbnail.startsWith("https://"))) {
    return null;
  }
  if (!Array.isArray(artists) || artists.length > 50) return null;

  const cleanArtists: ArtistRef[] = [];
  for (const artist of artists) {
    const { id = null, name = null } = (artist ?? {}) as Record<string, unknown>;
    if ((id !== null && typeof id !== "string") || (name !== null && typeof name !== "string")) {
      return null;
    }
    cleanArtists.push({ id, name });
  }
  return { video_id, title, artists: cleanArtists, thumbnail };
}
