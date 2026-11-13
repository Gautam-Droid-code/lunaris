export type RoomPresence = { userId: string; name: string };

export function displayName(user: {
  user_metadata?: { full_name?: string; name?: string } | null;
  email?: string | null;
} | null): string {
  if (!user) return "Guest";
  const meta = user.user_metadata ?? {};
  const name = (meta.full_name || meta.name || "").trim();
  if (name) return name;
  const email = user.email ?? "";
  const local = email.split("@")[0]?.trim();
  if (local) return local;
  return "Guest";
}
