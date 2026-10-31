import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { CollectionView } from "@/components/collection-view";
import { LoadingCard, Notice, ServiceNotice } from "@/components/notice";
import { artistNames } from "@/lib/format";
import { attempt, getAlbum } from "@/lib/music";

export const metadata: Metadata = { title: "Album · Lunaris" };

async function AlbumContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await attempt(() => getAlbum(id));

  if (!result.ok) return <ServiceNotice kind={result.kind} />;
  if (!result.data) return <Notice title="We couldn't find that album" />;

  const album = result.data;
  const details = [artistNames(album.artists), album.year].filter(Boolean);

  return (
    <CollectionView
      kind="album"
      title={album.title ?? "Untitled album"}
      subtitle={details.join(" · ")}
      thumbnails={album.thumbnails}
      tracks={album.tracks}
    />
  );
}

export default function AlbumPage({ params }: PageProps<"/album/[id]">) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-7 px-5 pb-32 pt-5">
      <AppHeader showBack />
      <Suspense fallback={<LoadingCard label="Loading album…" />}>
        <AlbumContent params={params} />
      </Suspense>
    </main>
  );
}
