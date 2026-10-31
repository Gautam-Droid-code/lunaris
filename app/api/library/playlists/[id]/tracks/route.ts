import { NextResponse, type NextRequest } from "next/server";
import { asUser, badRequest } from "@/lib/library-api";
import { parseSavedTrack } from "@/lib/library";

export function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/library/playlists/[id]/tracks">,
) {
  return asUser(request, async (supabase) => {
    const { id } = await params;
    const track = parseSavedTrack(await request.json());
    if (!track) return badRequest();

    const { data, error } = await supabase
      .from("playlist_tracks")
      .select("video_id, position")
      .eq("playlist_id", id)
      .order("position", { ascending: false });
    if (error) throw error;
    if (data.some((row) => row.video_id === track.video_id)) {
      return NextResponse.json({ added: false });
    }

    const { error: insertError } = await supabase
      .from("playlist_tracks")
      .insert({ ...track, playlist_id: id, position: (data[0]?.position ?? -1) + 1 });
    if (insertError) throw insertError;
    return NextResponse.json({ added: true });
  });
}
