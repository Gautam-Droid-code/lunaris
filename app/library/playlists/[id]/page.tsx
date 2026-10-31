import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { LoadingCard } from "@/components/notice";
import { SavedPlaylist } from "@/components/saved-playlist";

export const metadata: Metadata = { title: "Playlist · Lunaris" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SavedPlaylist id={id} />;
}

export default function SavedPlaylistPage({ params }: PageProps<"/library/playlists/[id]">) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 pb-32 pt-5">
      <AppHeader showBack />
      <Suspense fallback={<LoadingCard label="Loading playlist…" />}>
        <Content params={params} />
      </Suspense>
    </main>
  );
}
