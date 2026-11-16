import { NextResponse } from "next/server";

export async function POST() {
  const base = process.env.MUSIC_SERVICE_URL ?? "http://localhost:8000";
  try {
    const response = await fetch(`${base}/admin/update-extractor`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.ok ? 200 : 502 });
  } catch (error) {
    return NextResponse.json({ ok: false, detail: String(error) }, { status: 502 });
  }
}
