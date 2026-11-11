/**
 * The Supabase credentials, with a clear failure when they are missing.
 *
 * `process.env.NEXT_PUBLIC_*` is read literally, never through a variable key,
 * so Next can still inline these at build time.
 */

const SETUP_HINT =
  "copy .env.example to .env.local and fill it in " +
  "(Supabase dashboard -> Project Settings -> API)";

function required(name: string, value: string | undefined): string {
  // Covers both unset and declared-but-empty, which a `!` assertion lets through.
  if (!value || value.trim() === "") {
    throw new Error(`${name} is not set - ${SETUP_HINT}`);
  }
  return value.trim();
}

/** The project URL and anon key, or a named error naming the one that is missing. */
export function supabaseEnv(): { url: string; anonKey: string } {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}
