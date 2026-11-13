import { NextResponse, type NextRequest } from "next/server";
import { asUser } from "@/lib/library-api";

export async function GET(request: NextRequest) {
  return asUser(request, async (supabase, user) => {
    const { data, error } = await supabase
      .from("room_members")
      .select("room_id, rooms(id, code, leader_id)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return NextResponse.json(null);
    const rooms = (data as { rooms: { id: string; code: string; leader_id: string } | { id: string; code: string; leader_id: string }[] | null }).rooms;
    const room = Array.isArray(rooms) ? rooms[0] ?? null : rooms;
    if (!room) return NextResponse.json(null);
    return NextResponse.json({ ...room, isLeader: room.leader_id === user.id });
  });
}
