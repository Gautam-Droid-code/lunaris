import { NextResponse, type NextRequest } from "next/server";
import { asUser } from "@/lib/library-api";

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/rooms/[id]/handoff">,
) {
  const { id } = await params;
  return asUser(request, async (supabase) => {
    let body: { userId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    const userId = body?.userId;
    if (typeof userId !== "string" || !userId) {
      return NextResponse.json({ error: "userId must be a string" }, { status: 400 });
    }
    const { error } = await supabase.rpc("handoff_room", { p_room: id, p_user: userId });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  });
}
