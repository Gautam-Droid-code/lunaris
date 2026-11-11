import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";

import { SavedPlaylist } from "@/components/saved-playlist";

export const metadata: Metadata = { title: "Playlist · Lunaris" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SavedPlaylist id={id} />;
}

export default function SavedPlaylistPage({ params }: PageProps<"/library/playlists/[id]">) {
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
          <Content params={params} />
        </Suspense>
      </div>
    </main>
  );
}
