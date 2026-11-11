import { NextResponse, type NextRequest } from "next/server";
import { createSupabase } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

/**
 * Where email + OAuth links land: turns the code into a session, then sends the
 * visitor on to a validated same-site path (sign-up -> /library, password reset
 * -> /reset-password, Google -> wherever they were headed).
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  if (code) {
    const supabase = await createSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?confirm=failed`);
}
