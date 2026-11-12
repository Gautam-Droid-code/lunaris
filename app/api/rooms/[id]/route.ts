import { NextResponse, type NextRequest } from "next/server";
import { asUser } from "@/lib/library-api";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/rooms/[id]">,
) {
  const { id } = await params;
  return asUser(request, async (supabase, user) => {
    const { data, error } = await supabase
      .from("rooms")
      .select("id, code, leader_id")
      .eq("id", id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    return NextResponse.json({ ...data, isLeader: data.leader_id === user.id });
  });
}
