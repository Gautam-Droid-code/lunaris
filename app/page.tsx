import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { WelcomeView } from "@/components/welcome-view";
import { attempt, getCharts, getPlaylist } from "@/lib/music";
import { createSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Lunaris" };
export const instant = false;

async function Content() {
  const supabase = await createSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/browse");

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
