"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabase } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

export type AuthResult = { status: "idle" | "done" | "confirm" | "error"; message?: string };

const MIN_PASSWORD_LENGTH = 6;

async function origin(): Promise<string | null> {
  return (await headers()).get("origin");
}

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${await origin()}/auth/callback` },
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

/**
 * Starts the Google OAuth flow. Supabase hands back a URL to send the visitor to;
 * Google then returns them to /auth/callback, which exchanges the code for a session.
 * `next` (a same-site path) is carried through so they land where they intended.
 */
export async function signInWithGoogle(form: FormData) {
  const next = safeNext(String(form.get("next") ?? ""));
  let destination: string;
  try {
    const supabase = await createSupabase();
    const redirectTo = `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error || !data.url) {
      redirect("/login?oauth=failed");
    }
    destination = data.url;
  } catch {
    redirect("/login?oauth=failed");
  }
  // redirect() must run outside the try: it works by throwing, which the catch would swallow.
  redirect(destination);
}

/** Sends the password-reset email. Its link lands on /auth/callback, then /reset-password. */
export async function requestPasswordReset(_: AuthResult, form: FormData): Promise<AuthResult> {
  const email = String(form.get("email") ?? "").trim();
  if (!email) return { status: "error", message: "Enter your email." };

  try {
    const supabase = await createSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await origin()}/auth/callback?next=/reset-password`,
    });
    if (error) return { status: "error", message: error.message };
    // Always report success, so the form can't be used to probe which emails exist.
    return { status: "confirm" };
  } catch {
    return { status: "error", message: "Couldn't reach the account service. Try again." };
  }
}

/** Sets a new password for the visitor whose recovery link gave them a session. */
export async function updatePassword(_: AuthResult, form: FormData): Promise<AuthResult> {
  const password = String(form.get("password") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { status: "error", message: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  try {
    const supabase = await createSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { status: "error", message: "Your reset link has expired. Request a new one." };
    }
    const { error } = await supabase.auth.updateUser({ password });
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
