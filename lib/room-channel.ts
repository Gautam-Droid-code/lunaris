"use client";

import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

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

/**
 * Opens a Realtime presence channel for a room. Tracks this user and calls
 * `onPresence` with the synced member list whenever it changes.
 * Returns a cleanup function (untrack + removeChannel) for unmount.
 */
export function joinRoomChannel(
  roomId: string,
  userId: string,
  name: string,
  onPresence: (members: RoomPresence[]) => void,
): () => void {
  const supabase = createSupabaseBrowser();
  const channel: RealtimeChannel = supabase.channel(`room:${roomId}`, {
    config: { presence: { key: userId } },
  });

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState() as Record<string, Array<{ userId?: string; name?: string }>>;
    const members: RoomPresence[] = [];
    const seen = new Set<string>();
    for (const key of Object.keys(state)) {
      for (const entry of state[key] ?? []) {
        const uid = entry.userId ?? key;
        if (seen.has(uid)) continue;
        seen.add(uid);
        members.push({ userId: uid, name: entry.name ?? "Guest" });
      }
    }
    onPresence(members);
  });

  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({ userId, name });
    }
  });

  return () => {
    try {
      channel.untrack();
    } catch {
      // ignore
    }
    supabase.removeChannel(channel);
  };
}
