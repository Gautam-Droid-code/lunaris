import { NextResponse } from "next/server";
import { attempt, getLyrics } from "@/lib/music";

export async function GET(_request: Request, ctx: RouteContext<"/api/lyrics/[videoId]">) {
  const { videoId } = await ctx.params;
  const result = await attempt(() => getLyrics(videoId));
  if (!result.ok) return NextResponse.json(null, { status: 502 });
  return NextResponse.json(result.data);
}
