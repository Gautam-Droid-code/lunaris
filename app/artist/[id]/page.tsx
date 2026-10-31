import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Cover } from "@/components/cover";
import { MediaRow, type MediaItem } from "@/components/media-row";
import { LoadingCard, Notice, ServiceNotice } from "@/components/notice";
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

  if (!result.ok) return <ServiceNotice kind={result.kind} />;
  if (!result.data) return <Notice title="We couldn't find that artist" />;

  const artist = result.data;
  const name = artist.name ?? "Unknown artist";

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col items-center gap-4 text-center">
        <Cover
          thumbnails={artist.thumbnails}
          alt={name}
          size={320}
          className="size-40 rounded-full shadow-raised"
        />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          {artist.monthlyListeners && (
            <p className="mt-1 text-sm text-text-muted">
              {artist.monthlyListeners} monthly listeners
            </p>
          )}
        </div>
      </section>

      {artist.songs.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold tracking-tight">Top songs</h2>
          <TrackList tracks={artist.songs} />
        </section>
      )}
      <MediaRow title="Albums" items={albumItems(artist.albums, "album")} />
      <MediaRow title="Singles" items={albumItems(artist.singles, "single")} />
    </div>
  );
}

export default function ArtistPage({ params }: PageProps<"/artist/[id]">) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-7 px-5 pb-32 pt-5">
      <AppHeader showBack />
      <Suspense fallback={<LoadingCard label="Loading artist…" />}>
        <ArtistContent params={params} />
      </Suspense>
    </main>
  );
}
