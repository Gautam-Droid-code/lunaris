import { NextResponse, type NextRequest } from "next/server";
import { attempt, getSuggestions } from "@/lib/music";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  const result = await attempt(() => getSuggestions(q));
  if (!result.ok) return NextResponse.json([], { status: 502 });
  return NextResponse.json(result.data);
}
