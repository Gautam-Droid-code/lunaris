import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/stream/[videoId]">,
) {
  const { videoId } = await params;
  const base = process.env.MUSIC_SERVICE_URL ?? "http://localhost:8000";
  const target = `${base}/stream/${encodeURIComponent(videoId)}`;

  const headers: Record<string, string> = {};
  const range = request.headers.get("range");
  if (range) headers["range"] = range;

  let upstream: Response;
  try {
    upstream = await fetch(target, { headers });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: "upstream failed" }, { status: upstream.status });
  }

  const responseHeaders = new Headers();
  for (const h of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const v = upstream.headers.get(h);
    if (v) responseHeaders.set(h, v);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
