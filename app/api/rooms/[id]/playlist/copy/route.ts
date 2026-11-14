import { NextResponse, type NextRequest } from "next/server";
import { asUser } from "@/lib/library-api";

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/rooms/[id]/playlist/copy">,
) {
  const { id } = await params;
  return asUser(request, async (supabase) => {
    const { data, error } = await supabase.rpc("room_playlist_copy_to_me", { p_room: id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ playlistId: data });
  });
}
