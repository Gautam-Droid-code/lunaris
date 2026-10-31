import { NextResponse, type NextRequest } from "next/server";
import { badRequest, asUser } from "@/lib/library-api";
import { parseSavedTrack, type SavedTrack } from "@/lib/library";

const MAX_TRACKS = 1000;

export function POST(request: NextRequest) {
  return asUser(request, async (supabase, user) => {
    const { tracks } = await request.json();
    if (!Array.isArray(tracks) || tracks.length === 0 || tracks.length > MAX_TRACKS) {
      return badRequest();
    }
    const parsed = tracks.map(parseSavedTrack);
    if (parsed.includes(null)) return badRequest();

    const rows = (parsed as SavedTrack[]).map((track) => ({ ...track, user_id: user.id }));
    const { error } = await supabase
      .from("liked_songs")
      .upsert(rows, { onConflict: "user_id,video_id", ignoreDuplicates: true });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  });
}

export function DELETE(request: NextRequest) {
  return asUser(request, async (supabase, user) => {
    const { videoIds } = await request.json();
    const valid =
      Array.isArray(videoIds) &&
      videoIds.length > 0 &&
      videoIds.length <= MAX_TRACKS &&
      videoIds.every((id) => typeof id === "string");
    if (!valid) return badRequest();

    const { error } = await supabase
      .from("liked_songs")
      .delete()
      .eq("user_id", user.id)
      .in("video_id", videoIds);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  });
}
