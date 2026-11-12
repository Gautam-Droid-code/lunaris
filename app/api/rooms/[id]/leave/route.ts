import { NextResponse, type NextRequest } from "next/server";
import { asUser } from "@/lib/library-api";

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/rooms/[id]/leave">,
) {
  const { id } = await params;
  return asUser(request, async (supabase) => {
    const { error } = await supabase.rpc("leave_room", { p_room: id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  });
}
