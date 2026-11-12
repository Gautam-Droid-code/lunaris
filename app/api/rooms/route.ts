import { NextResponse, type NextRequest } from "next/server";
import { asUser } from "@/lib/library-api";

export async function POST(request: NextRequest) {
  return asUser(request, async (supabase) => {
    const { data, error } = await supabase.rpc("create_room");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  });
}
