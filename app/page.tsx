import Link from "next/link";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Cover } from "@/components/cover";
import { SearchIcon } from "@/components/icons";
import { MediaRow } from "@/components/media-row";
import { LoadingCard, Notice, ServiceNotice } from "@/components/notice";
import { TrackList } from "@/components/track-list";
import { attempt, getCharts, getPlaylist } from "@/lib/music";

const FEATURED_TRACKS = 10;

async function Browse() {
  const charts = await attempt(() => getCharts());
  if (!charts.ok) return <ServiceNotice kind={charts.kind} />;

  const featured = charts.data?.playlists.find((playlist) => playlist.id);
  const artists = charts.data?.artists ?? [];
  const playlist = await attempt(async () =>
    featured?.id ? getPlaylist(featured.id, FEATURED_TRACKS) : null,
  );

  return (
    <div className="flex flex-col gap-7">
      {!playlist.ok ? (
        <ServiceNotice kind={playlist.kind} />
      ) : playlist.data ? (
        <section>
          <div className="mb-2 flex items-center gap-4">
            <Cover
              thumbnails={playlist.data.thumbnails}
              alt=""
              size={160}
              className="size-20 shrink-0 rounded-3xl shadow-raised-sm"
            />
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 text-lg font-semibold tracking-tight">
                {playlist.data.title ?? "Top chart"}
              </h2>
              <Link
                href={`/playlist/${playlist.data.id}`}
                className="inline-flex min-h-11 items-center text-sm font-medium text-accent"
              >
                View full chart
              </Link>
            </div>
          </div>
          <TrackList tracks={playlist.data.tracks} />
        </section>
      ) : (
        <Notice title="No chart playlist is available right now" />
      )}

      <MediaRow
        title="Trending artists"
        round
        items={artists.slice(0, 12).map((artist, index) => ({
          key: artist.id ?? `artist-${index}`,
          href: artist.id ? `/artist/${artist.id}` : null,
          title: artist.name ?? "Unknown artist",
          subtitle: artist.rank ? `#${artist.rank}` : null,
          thumbnails: artist.thumbnails,
        }))}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 pb-32 pt-5">
      <AppHeader />
      <Link
        href="/search"
        className="flex min-h-12 items-center gap-3 rounded-full px-5 text-text-muted shadow-pressed"
      >
        <SearchIcon className="size-5 shrink-0" />
        Search songs, albums, artists
      </Link>
      <Suspense fallback={<LoadingCard label="Loading the charts…" />}>
        <Browse />
      </Suspense>
    </main>
  );
}
