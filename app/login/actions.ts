"use server";

import { headers } from "next/headers";
import { createSupabase } from "@/lib/supabase/server";

export type AuthResult = { status: "idle" | "done" | "confirm" | "error"; message?: string };

const MIN_PASSWORD_LENGTH = 6;

export async function authenticate(_: AuthResult, form: FormData): Promise<AuthResult> {
  const mode = form.get("mode");
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) {
    return { status: "error", message: "Enter your email and password." };
  }
  if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH) {
    return { status: "error", message: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  try {
    const supabase = await createSupabase();
    if (mode === "signup") {
      const origin = (await headers()).get("origin");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) return { status: "error", message: error.message };
      return { status: data.session ? "done" : "confirm" };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { status: "error", message: error.message };
    return { status: "done" };
  } catch {
    return { status: "error", message: "Couldn't reach the account service. Try again." };
  }
}

export async function signOut() {
  const supabase = await createSupabase();
  await supabase.auth.signOut();
}
