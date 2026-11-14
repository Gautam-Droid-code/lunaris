"use client";

import { useSyncExternalStore } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { displayName, type RoomPresence } from "@/lib/room-channel";

type CurrentRoom = { id: string; code: string; leader_id: string; isLeader: boolean };

type State = {
  room: CurrentRoom | null;
  members: RoomPresence[];
  ready: boolean;
};

let state: State = { room: null, members: [], ready: false };
const listeners = new Set<() => void>();
let cleanup: (() => void) | null = null;
let heartbeat: ReturnType<typeof setInterval> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

async function fetchCurrentRoom(): Promise<CurrentRoom | null> {
  try {
    const res = await fetch("/api/rooms/current");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data) return null;
    return data as CurrentRoom;
  } catch {
    return null;
  }
}

function openChannel(roomId: string, userId: string, name: string) {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  const supabase = createSupabaseBrowser();
  const ch = supabase.channel(`room:${roomId}`, {
    config: { presence: { key: userId } },
  });
  ch.on("presence", { event: "sync" }, () => {
    const presenceState = ch.presenceState() as Record<
      string,
      Array<{ userId?: string; name?: string }>
    >;
    const members: RoomPresence[] = [];
    const seen = new Set<string>();
    for (const key of Object.keys(presenceState)) {
      for (const entry of presenceState[key] ?? []) {
        const uid = entry.userId ?? key;
        if (seen.has(uid)) continue;
        seen.add(uid);
        members.push({ userId: uid, name: entry.name ?? "Guest" });
      }
    }
    setState({ members });
  });
  ch.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await ch.track({ userId, name });
    }
  });
  const touch = () => {
    void supabase.rpc("touch_room_membership", { p_room: roomId });
  };
  touch();
  heartbeat = setInterval(touch, 30000);
  const onVisible = () => {
    if (document.visibilityState === "visible") touch();
  };
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", touch);
  cleanup = () => {
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", touch);
    try {
      ch.untrack();
    } catch {
      // ignore
    }
    supabase.removeChannel(ch);
  };
}

export async function refreshCurrentRoom() {
  const room = await fetchCurrentRoom();
  if (!room) {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    setState({ room: null, members: [], ready: true });
    return;
  }
  setState({ room, ready: true });
  const supabase = createSupabaseBrowser();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (user) {
    openChannel(room.id, user.id, displayName(user));
  }
}

export async function leaveRoom(roomId: string) {
  try {
    await fetch(`/api/rooms/${roomId}/leave`, { method: "POST" });
  } finally {
    clearCurrentRoom();
  }
}

export function clearCurrentRoom() {
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  setState({ room: null, members: [] });
}

export function useCurrentRoom() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}
