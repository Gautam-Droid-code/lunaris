import { MediaRow } from "@/components/media-row";
import { Notice, ServiceNotice } from "@/components/notice";
import { TrackList } from "@/components/track-list";
import { artistNames } from "@/lib/format";
import { attempt, search } from "@/lib/music";

export async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const term = (Array.isArray(q) ? q[0] : q)?.trim();
  if (!term) return <Notice title="Search for something to play" />;

  const result = await attempt(() =>
    Promise.all([
      search(term, "songs"),
      search(term, "albums"),
      search(term, "artists"),
      search(term, "playlists"),
    ]),
  );
  if (!result.ok) return <ServiceNotice kind={result.kind} />;

  const [songs, albums, artists, playlists] = result.data;
  if (songs.length + albums.length + artists.length + playlists.length === 0) {
    return <Notice title={`No results for “${term}”`} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {songs.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold tracking-tight">Songs</h2>
          <TrackList tracks={songs.slice(0, 8)} playsAlone />
        </section>
      )}
      <MediaRow
        title="Artists"
        round
        items={artists.slice(0, 10).map((artist, index) => ({
          key: artist.id ?? `artist-${index}`,
          href: artist.id ? `/artist/${artist.id}` : null,
          title: artist.name ?? "Unknown artist",
          thumbnails: artist.thumbnails,
        }))}
      />
      <MediaRow
        title="Albums"
        items={albums.slice(0, 10).map((album, index) => ({
          key: album.id ?? `album-${index}`,
          href: album.id ? `/album/${album.id}` : null,
          title: album.title ?? "Untitled",
          subtitle: artistNames(album.artists),
          thumbnails: album.thumbnails,
        }))}
      />
      <MediaRow
        title="Playlists"
        items={playlists.slice(0, 10).map((playlist, index) => ({
          key: playlist.id ?? `playlist-${index}`,
          href: playlist.id ? `/playlist/${playlist.id}` : null,
          title: playlist.title ?? "Untitled",
          subtitle: playlist.author?.name,
          thumbnails: playlist.thumbnails,
        }))}
      />
    </div>
  );
}
