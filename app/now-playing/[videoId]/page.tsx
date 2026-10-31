import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { LoadingCard, Notice, ServiceNotice } from "@/components/notice";
import { NowPlayingDetails } from "@/components/now-playing-details";
import { PlayerSlot } from "@/components/player-provider";
import { attempt, getSong } from "@/lib/music";

export const metadata: Metadata = { title: "Now Playing · Lunaris" };

async function SongContent({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  const result = await attempt(() => getSong(videoId));

  if (!result.ok) return <ServiceNotice kind={result.kind} />;
  if (!result.data) return <Notice title="We couldn't find that song" />;

  return <NowPlayingDetails song={result.data} />;
}

export default function NowPlayingPage({ params }: PageProps<"/now-playing/[videoId]">) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-7 px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-5">
      <AppHeader showBack />
      <PlayerSlot
        interactive
        className="album-art aspect-video w-full overflow-hidden rounded-3xl shadow-raised"
      />
      <Suspense fallback={<LoadingCard label="Loading song…" />}>
        <SongContent params={params} />
      </Suspense>
    </main>
  );
}
