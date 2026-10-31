import { NextResponse, type NextRequest } from "next/server";
import { asUser } from "@/lib/library-api";
import { toTrack, type SavedTrack } from "@/lib/library";

export function GET(request: NextRequest, { params }: RouteContext<"/api/library/playlists/[id]">) {
  return asUser(request, async (supabase) => {
    const { id } = await params;
    const { data: playlist } = await supabase
      .from("playlists")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();
    if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("playlist_tracks")
      .select("video_id, title, artists, thumbnail")
      .eq("playlist_id", id)
      .order("position");
    if (error) throw error;
    return NextResponse.json({ ...playlist, tracks: (data as SavedTrack[]).map(toTrack) });
  });
}
