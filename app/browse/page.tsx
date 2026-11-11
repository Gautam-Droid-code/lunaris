import Link from "next/link";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Cover } from "@/components/cover";
import { SearchIcon } from "@/components/icons";
import { MediaRow } from "@/components/media-row";
import { Notice, ServiceNotice } from "@/components/notice";
import { TrackList } from "@/components/track-list";
import { attempt, getCharts, getPlaylist } from "@/lib/music";

const FEATURED_TRACKS = 10;

async function Browse() {
  const charts = await attempt(() => getCharts());
  if (!charts.ok) return <ServiceNotice kind={charts.kind} variant="neumorphic" />;

  const featured = charts.data?.playlists.find((playlist) => playlist.id);
  const artists = charts.data?.artists ?? [];
  const playlist = await attempt(async () =>
    featured?.id ? getPlaylist(featured.id, FEATURED_TRACKS) : null,
  );

  return (
    <div className="flex flex-col gap-7">
      {!playlist.ok ? (
        <ServiceNotice kind={playlist.kind} variant="neumorphic" />
      ) : playlist.data ? (
        <section className="flex flex-col gap-3">
          <div className="nm-card nm-raised flex items-center gap-4 p-4">
            <div className="nm-well nm-inset shrink-0 p-1.5">
              <Cover
                thumbnails={playlist.data.thumbnails}
                alt=""
                size={160}
                className="size-20 rounded-[14px]"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="nm-eyebrow">Featured chart</p>
              <h2 className="mt-1 line-clamp-2 text-lg font-semibold tracking-tight nm-strong">
                {playlist.data.title ?? "Top chart"}
              </h2>
              <Link
                href={`/playlist/${playlist.data.id}`}
                className="nm-link mt-1.5 inline-flex min-h-9 items-center text-sm"
              >
                View full chart
              </Link>
            </div>
          </div>
          <TrackList tracks={playlist.data.tracks} variant="chart" />
        </section>
      ) : (
        <Notice variant="neumorphic" title="No chart playlist is available right now" />
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

export default function BrowsePage() {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pb-32 pt-5 md:max-w-4xl lg:max-w-6xl">
        <AppHeader showBack={false} />
        <Link
          href="/search"
          className="nm-search mx-auto flex min-h-12 w-full max-w-2xl items-center gap-3 px-5"
        >
          <SearchIcon className="nm-search-icon size-5 shrink-0" />
          <span className="min-w-0 truncate">Search songs, albums, artists</span>
        </Link>
        <Suspense
          fallback={
            <div className="flex flex-col gap-3">
              <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
              <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
              <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
            </div>
          }
        >
          <Browse />
        </Suspense>
      </div>
    </main>
  );
}
