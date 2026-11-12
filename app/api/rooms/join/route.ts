import { NextResponse, type NextRequest } from "next/server";
import { asUser } from "@/lib/library-api";

export async function POST(request: NextRequest) {
  return asUser(request, async (supabase) => {
    let body: { code?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    const code = body?.code;
    if (typeof code !== "string" || code.length !== 6) {
      return NextResponse.json({ error: "Code must be a 6-character string" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("join_room", { p_code: code });
    if (error) {
      const msg = error.message ?? "";
      if (msg.toLowerCase().includes("not found")) {
        return NextResponse.json({ error: msg }, { status: 404 });
      }
      if (msg.toLowerCase().includes("full")) {
        return NextResponse.json({ error: msg }, { status: 409 });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json(data);
  });
}
