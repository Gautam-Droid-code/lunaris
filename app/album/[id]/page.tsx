import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { CollectionView } from "@/components/collection-view";
import { Notice, ServiceNotice } from "@/components/notice";
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
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
        <AppHeader showBack />
        <Suspense
          fallback={
            <div className="flex flex-col gap-3">
              <div className="nm-well nm-inset h-40 animate-pulse rounded-2xl" />
              <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
              <div className="nm-well nm-inset h-14 animate-pulse rounded-2xl" />
            </div>
          }
        >
          <AlbumContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
