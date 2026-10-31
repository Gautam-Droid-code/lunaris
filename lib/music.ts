import "server-only";

const BASE_URL = process.env.MUSIC_SERVICE_URL ?? "http://localhost:8000";
const TIMEOUT_MS = 10_000;

export type Thumbnail = { url: string; width: number | null; height: number | null };
export type ArtistRef = { id: string | null; name: string | null };
type AlbumRef = { id: string | null; name: string | null };

export type Track = {
  id: string;
  videoId: string;
  title: string | null;
  artists: ArtistRef[];
  album: AlbumRef | null;
  duration: string | null;
  durationSeconds: number | null;
  thumbnails: Thumbnail[];
  isExplicit: boolean | null;
};

export type Song = Track & { viewCount: string | null; playable: boolean };

export type AlbumSummary = {
  id: string | null;
  browseId: string | null;
  playlistId: string | null;
  title: string | null;
  type: string | null;
  artists: ArtistRef[];
  year: string | null;
  thumbnails: Thumbnail[];
  isExplicit: boolean | null;
};

type ArtistSummary = {
  id: string | null;
  browseId: string | null;
  name: string | null;
  thumbnails: Thumbnail[];
};

type PlaylistSummary = {
  id: string | null;
  browseId: string | null;
  playlistId: string | null;
  title: string | null;
  author: ArtistRef | null;
  itemCount: number | string | null;
  thumbnails: Thumbnail[];
};

export type Album = AlbumSummary & {
  description: string | null;
  trackCount: number | null;
  duration: string | null;
  durationSeconds: number | null;
  tracks: Track[];
};

export type Artist = ArtistSummary & {
  description: string | null;
  subscribers: string | null;
  monthlyListeners: string | null;
  radioId: string | null;
  shuffleId: string | null;
  songs: Track[];
  albums: AlbumSummary[];
  singles: AlbumSummary[];
  videos: Track[];
  relatedArtists: ArtistSummary[];
};

export type Playlist = {
  id: string | null;
  playlistId: string | null;
  title: string | null;
  description: string | null;
  author: ArtistRef | null;
  year: string | null;
  trackCount: number | null;
  duration: string | null;
  durationSeconds: number | null;
  thumbnails: Thumbnail[];
  tracks: Track[];
};

export type Lyrics = {
  videoId: string;
  lyrics: string | null;
  source: string | null;
  hasTimestamps: boolean;
};

export type Radio = { videoId: string; playlistId: string | null; tracks: Track[] };

type RankedArtist = ArtistSummary & {
  rank: string | null;
  trend: string | null;
  subscribers: string | null;
};

type Charts = {
  country: string;
  countryName: string | null;
  availableCountries: string[];
  songs: Track[];
  playlists: PlaylistSummary[];
  artists: RankedArtist[];
};

type SearchResultMap = {
  songs: Track;
  albums: AlbumSummary;
  artists: ArtistSummary;
  playlists: PlaylistSummary;
};

type SearchType = keyof SearchResultMap;

type SearchResponse<T extends SearchType> = {
  query: string;
  type: T;
  results: SearchResultMap[T][];
};

export type ServiceErrorKind = "unreachable" | "upstream";

class ServiceError extends Error {
  constructor(readonly kind: ServiceErrorKind) {
    super(`Music service request failed: ${kind}`);
    this.name = "ServiceError";
  }
}

/** Fetches JSON from the service. Returns null when the item does not exist. */
async function request<T>(path: string): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ServiceError("unreachable");
  }

  if (response.status === 400 || response.status === 404) return null;
  if (!response.ok) throw new ServiceError("upstream");
  return (await response.json()) as T;
}

function query(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => [key, String(value)]);
  return new URLSearchParams(entries).toString();
}

const segment = encodeURIComponent;

export async function search<T extends SearchType>(q: string, type: T) {
  const data = await request<SearchResponse<T>>(`/search?${query({ q, type })}`);
  return data?.results ?? [];
}

export async function getSuggestions(q: string): Promise<string[]> {
  const path = `/search/suggestions?${query({ q })}`;
  const data = await request<{ suggestions: string[] }>(path);
  return data?.suggestions ?? [];
}

export function getSong(videoId: string) {
  return request<Song>(`/song/${segment(videoId)}`);
}

export function getAlbum(browseId: string) {
  return request<Album>(`/album/${segment(browseId)}`);
}

export function getArtist(browseId: string) {
  return request<Artist>(`/artist/${segment(browseId)}`);
}

export function getPlaylist(playlistId: string, limit?: number) {
  return request<Playlist>(`/playlist/${segment(playlistId)}?${query({ limit })}`);
}

/** Returns null when the song has no lyrics. */
export function getLyrics(videoId: string) {
  return request<Lyrics>(`/lyrics/${segment(videoId)}`);
}

export function getRadio(videoId: string, limit?: number) {
  return request<Radio>(`/radio/${segment(videoId)}?${query({ limit })}`);
}

export function getCharts(country = "ZZ") {
  return request<Charts>(`/charts?${query({ country })}`);
}

type Attempt<T> = { ok: true; data: T } | { ok: false; kind: ServiceErrorKind };

/** Runs a data call and reports service failures as a value the UI can render. */
export async function attempt<T>(load: () => Promise<T>): Promise<Attempt<T>> {
  try {
    return { ok: true, data: await load() };
  } catch (error) {
    if (error instanceof ServiceError) return { ok: false, kind: error.kind };
    throw error;
  }
}
