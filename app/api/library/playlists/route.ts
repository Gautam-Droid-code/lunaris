import { NextResponse, type NextRequest } from "next/server";
import { asUser, badRequest } from "@/lib/library-api";
import type { PlaylistInfo } from "@/lib/library";

const MAX_NAME_LENGTH = 100;

export function POST(request: NextRequest) {
  return asUser(request, async (supabase, user) => {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > MAX_NAME_LENGTH) return badRequest();

    const { data, error } = await supabase
      .from("playlists")
      .insert({ name, user_id: user.id })
      .select("id, name")
      .single();
    if (error) throw error;
    const playlist: PlaylistInfo = { ...data, trackCount: 0 };
    return NextResponse.json(playlist);
  });
}
