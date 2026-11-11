import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { CollectionView } from "@/components/collection-view";
import { Notice, ServiceNotice } from "@/components/notice";
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
          <PlaylistContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
