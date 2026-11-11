import type { Metadata } from "next";
import { Suspense } from "react";
import { WelcomeView } from "@/components/welcome-view";
import { attempt, getCharts, getPlaylist } from "@/lib/music";

export const metadata: Metadata = { title: "Lunaris" };

async function Content() {
  const charts = await attempt(() => getCharts());
  const data = charts.ok ? charts.data : null;
  const featured = data?.playlists?.find((playlist) => playlist.id);
  const playlist = featured?.id
    ? await attempt(() => getPlaylist(featured.id as string, 8))
    : null;
  const tracks = playlist?.ok ? (playlist.data?.tracks ?? []) : [];
  return <WelcomeView charts={data} tracks={tracks} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="nm-screen min-h-dvh" />}>
      <Content />
    </Suspense>
  );
}
