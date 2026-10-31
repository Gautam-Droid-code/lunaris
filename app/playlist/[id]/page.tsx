import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { CollectionView } from "@/components/collection-view";
import { LoadingCard, Notice, ServiceNotice } from "@/components/notice";
import { attempt, getPlaylist } from "@/lib/music";

export const metadata: Metadata = { title: "Playlist · Lunaris" };

async function PlaylistContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await attempt(() => getPlaylist(id));

  if (!result.ok) return <ServiceNotice kind={result.kind} />;
  if (!result.data) return <Notice title="We couldn't find that playlist" />;

  const playlist = result.data;
  const count = playlist.trackCount ?? playlist.tracks.length;
  const details = [playlist.author?.name, `${count} tracks`].filter(Boolean);

  return (
    <CollectionView
      kind="playlist"
      title={playlist.title ?? "Untitled playlist"}
      subtitle={details.join(" · ")}
      thumbnails={playlist.thumbnails}
      tracks={playlist.tracks}
    />
  );
}

export default function PlaylistPage({ params }: PageProps<"/playlist/[id]">) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-7 px-5 pb-32 pt-5">
      <AppHeader showBack />
      <Suspense fallback={<LoadingCard label="Loading playlist…" />}>
        <PlaylistContent params={params} />
      </Suspense>
    </main>
  );
}
