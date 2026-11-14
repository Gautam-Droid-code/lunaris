import { NextResponse, type NextRequest } from "next/server";
import { asUser, badRequest } from "@/lib/library-api";
import { toTrack, type SavedTrack } from "@/lib/library";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/rooms/[id]/playlist">,
) {
  const { id } = await params;
  return asUser(request, async (supabase) => {
    const { data: room } = await supabase
      .from("rooms")
      .select("group_playlist_id")
      .eq("id", id)
      .maybeSingle();
    const playlistId = room?.group_playlist_id ?? null;
    if (!playlistId) return NextResponse.json({ playlistId: null, tracks: [] });

    const { data, error } = await supabase
      .from("playlist_tracks")
      .select("video_id, title, artists, thumbnail")
      .eq("playlist_id", playlistId)
      .order("position");
    if (error) throw error;
    return NextResponse.json({
      playlistId,
      tracks: (data as SavedTrack[]).map(toTrack),
    });
  });
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/rooms/[id]/playlist">,
) {
  const { id } = await params;
  return asUser(request, async (supabase) => {
    let body: {
      videoId?: unknown;
      title?: unknown;
      artists?: unknown;
      thumbnail?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return badRequest();
    }
    const videoId = typeof body.videoId === "string" ? body.videoId : null;
    const title = typeof body.title === "string" ? body.title : null;
    if (!videoId || !title) return badRequest();
    const artists = Array.isArray(body.artists) ? body.artists : [];
    const thumbnail = typeof body.thumbnail === "string" ? body.thumbnail : null;

    const { error } = await supabase.rpc("room_playlist_add", {
      p_room: id,
      p_video_id: videoId,
      p_title: title,
      p_artists: artists,
      p_thumbnail: thumbnail,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext<"/api/rooms/[id]/playlist">,
) {
  const { id } = await params;
  return asUser(request, async (supabase) => {
    let body: { videoId?: unknown };
    try {
      body = await request.json();
    } catch {
      return badRequest();
    }
    const videoId = typeof body.videoId === "string" ? body.videoId : null;
    if (!videoId) return badRequest();
    const { error } = await supabase.rpc("room_playlist_remove", {
      p_room: id,
      p_video_id: videoId,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  });
}
