import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { LoadingCard, Notice, ServiceNotice } from "@/components/notice";
import { NowPlayingDetails } from "@/components/now-playing-details";
import { attempt, getSong } from "@/lib/music";
import "../now-playing.css";

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
    <main
      className="nm-screen min-h-dvh px-4 pb-[calc(env(safe-area-inset-bottom)_+_2rem)] pt-5 sm:px-6"
    >
      <div className="mx-auto w-full max-w-6xl">
        <AppHeader showBack />
        <Suspense
          fallback={
            <div className="mt-7">
              <LoadingCard label="Loading song…" />
            </div>
          }
        >
          <SongContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
