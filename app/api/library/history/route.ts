import { NextResponse, type NextRequest } from "next/server";
import { asUser, badRequest } from "@/lib/library-api";
import { parseSavedTrack } from "@/lib/library";

export function POST(request: NextRequest) {
  return asUser(request, async (supabase, user) => {
    const track = parseSavedTrack(await request.json());
    if (!track) return badRequest();

    const { error } = await supabase.from("play_history").insert({ ...track, user_id: user.id });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  });
}
