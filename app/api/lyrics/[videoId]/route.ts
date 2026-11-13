import { NextResponse } from "next/server";
import { attempt, getLyrics, getSong } from "@/lib/music";
import { parseLRC } from "@/lib/lrc";

async function tryLrclib(videoId: string) {
  let title: string | null = null;
  let artist: string | null = null;
  let duration: number | null = null;

  try {
    const song = await getSong(videoId);
    title = song?.title ?? null;
    artist =
      song?.artists
        ?.map((a) => a.name)
        .filter(Boolean)
        .join(", ") ?? null;
    duration = song?.durationSeconds ?? null;
  } catch {
    // ignore; try with whatever we have
  }

  if (!title) return null;

  const tryGet = async (params: URLSearchParams) => {
    try {
      const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const base = new URLSearchParams();
  base.set("track_name", title);
  if (artist) base.set("artist_name", artist);
  if (duration) base.set("duration", String(duration));

  let data = await tryGet(base);

  // Fallback to search if get misses.
  if (!data) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("track_name", title);
      if (artist) searchParams.set("artist_name", artist);
      const res = await fetch(`https://lrclib.net/api/search?${searchParams.toString()}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          data = results.find((r: { syncedLyrics?: unknown }) => r?.syncedLyrics) ?? results[0];
        }
      }
    } catch {
      // ignore
    }
  }

  if (!data) return null;

  const synced = typeof data.syncedLyrics === "string" ? data.syncedLyrics : null;
  const plain = typeof data.plainLyrics === "string" ? data.plainLyrics : null;

  if (synced) {
    const lines = parseLRC(synced);
    if (lines.length > 0) {
      return {
        videoId,
        lyrics: plain,
        lines,
        source: "LRCLIB",
        hasTimestamps: true,
      };
    }
  }

  if (plain) {
    return {
      videoId,
      lyrics: plain,
      source: "LRCLIB",
      hasTimestamps: false,
    };
  }

  return null;
}

export async function GET(_request: Request, ctx: RouteContext<"/api/lyrics/[videoId]">) {
  const { videoId } = await ctx.params;

  // Try LRCLIB (timed) first.
  try {
    const lrclib = await tryLrclib(videoId);
    if (lrclib) return NextResponse.json(lrclib);
  } catch {
    // fall through to music service
  }

  const result = await attempt(() => getLyrics(videoId));
  if (!result.ok) return NextResponse.json(null, { status: 502 });
  return NextResponse.json(result.data);
}
