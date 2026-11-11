import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { ArtistHero } from "@/components/artist-hero";
import { MediaRow, type MediaItem } from "@/components/media-row";
import { Notice, ServiceNotice } from "@/components/notice";
import { TrackList } from "@/components/track-list";
import { attempt, getArtist, type AlbumSummary } from "@/lib/music";

export const metadata: Metadata = { title: "Artist · Lunaris" };

function albumItems(albums: AlbumSummary[], prefix: string): MediaItem[] {
  return albums.map((album, index) => ({
    key: album.id ?? `${prefix}-${index}`,
    href: album.id ? `/album/${album.id}` : null,
    title: album.title ?? "Untitled",
    subtitle: album.year,
    thumbnails: album.thumbnails,
  }));
}

async function ArtistContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await attempt(() => getArtist(id));

  if (!result.ok) return <ServiceNotice kind={result.kind} variant="neumorphic" />;
  if (!result.data) return <Notice variant="neumorphic" title="We couldn't find that artist" />;

  const artist = result.data;
  const name = artist.name ?? "Unknown artist";
  const subtitle = artist.monthlyListeners
    ? `${artist.monthlyListeners} monthly listeners`
    : artist.subscribers
      ? `${artist.subscribers} subscribers`
      : null;

  return (
    <div className="flex flex-col gap-6">
      <ArtistHero
        name={name}
        subtitle={subtitle}
        thumbnails={artist.thumbnails}
        tracks={artist.songs}
      />

      {artist.songs.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight nm-strong">Top songs</h2>
          <TrackList tracks={artist.songs} variant="chart" />
        </section>
      ) : (
        <Notice variant="neumorphic" title="No top songs yet">
          Tracks will appear here when they&apos;re available.
        </Notice>
      )}

      <MediaRow
        title="Albums"
        neumorphic
        items={albumItems(artist.albums, "album")}
      />
      <MediaRow
        title="Singles"
        neumorphic
        items={albumItems(artist.singles, "single")}
      />

      {artist.description && (
        <section className="nm-card nm-raised p-5">
          <h2 className="text-lg font-semibold tracking-tight nm-strong">About</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed nm-muted">
            {artist.description}
          </p>
        </section>
      )}
    </div>
  );
}

export default function ArtistPage({ params }: PageProps<"/artist/[id]">) {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
        <AppHeader showBack />
        <Suspense
          fallback={
            <div className="flex flex-col gap-3">
              <div className="nm-well nm-inset h-40 animate-pulse rounded-full" />
              <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
              <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
            </div>
          }
        >
          <ArtistContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
