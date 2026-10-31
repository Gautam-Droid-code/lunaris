import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabase } from "@/lib/supabase/server";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && new URL(origin).host === request.headers.get("host");
}

/**
 * Runs a Route Handler as the signed-in user. Row-Level Security still decides which
 * rows that user can touch; this only rejects other sites, guests and failures cleanly.
 */
export async function asUser(
  request: NextRequest,
  handler: (supabase: SupabaseClient, user: User) => Promise<Response>,
): Promise<Response> {
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const supabase = await createSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return NextResponse.json({ error: "Log in first" }, { status: 401 });
    return await handler(supabase, data.user);
  } catch (error) {
    console.error("Library request failed", error);
    return NextResponse.json({ error: "Library request failed" }, { status: 500 });
  }
}

export const badRequest = () => NextResponse.json({ error: "Bad request" }, { status: 400 });
