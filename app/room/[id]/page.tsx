"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { AppHeader } from "@/components/app-header";
import { Notice } from "@/components/notice";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { displayName, joinRoomChannel, type RoomPresence } from "@/lib/room-channel";

type Room = { id: string; code: string; leader_id: string; isLeader: boolean };

export default function RoomScreen({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomPresence[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("Guest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cleanup: (() => void) | null = null;
    let mounted = true;

    (async () => {
      const supabase = createSupabaseBrowser();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.push("/login?next=" + encodeURIComponent(`/room/${id}`));
        return;
      }
      if (!mounted) return;
      setUserId(user.id);
      setName(displayName(user));

      const res = await fetch(`/api/rooms/${id}`);
      if (!res.ok) {
        setError("Room not found");
        setLoading(false);
        return;
      }
      const r: Room = await res.json();
      if (!mounted) return;
      setRoom(r);
      setLoading(false);

      cleanup = joinRoomChannel(id, user.id, displayName(user), (m) => {
        if (mounted) setMembers(m);
      });
    })();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, [id, router]);

  async function leave() {
    if (!id) return;
    setBusy(true);
    try {
      await fetch(`/api/rooms/${id}/leave`, { method: "POST" });
    } finally {
      router.push("/room");
    }
  }

  async function handoff(targetUserId: string) {
    if (!id) return;
    setBusy(true);
    try {
      await fetch(`/api/rooms/${id}/handoff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
      const res = await fetch(`/api/rooms/${id}`);
      if (res.ok) setRoom(await res.json());
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="nm-screen min-h-dvh">
        <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
          <AppHeader showBack />
          <div className="nm-well nm-inset h-40 animate-pulse rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="nm-screen min-h-dvh">
        <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
          <AppHeader showBack />
          <Notice variant="neumorphic" title={error ?? "Room not found"} />
        </div>
      </main>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const joinUrl = `${origin}/room?code=${room.code}`;

  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
        <AppHeader showBack />
        <section className="nm-card nm-raised p-5">
          <p className="nm-eyebrow">Room code</p>
          <p className="mt-2 text-3xl font-semibold tracking-widest nm-strong">{room.code}</p>
          <div className="mt-4 flex justify-center">
            <div className="nm-well nm-inset rounded-2xl p-3">
              <QRCodeSVG value={joinUrl} size={160} bgColor="transparent" fgColor="currentColor" />
            </div>
          </div>
          <p className="mt-3 text-center text-xs nm-muted">Scan to join</p>
        </section>

        <section className="nm-card nm-raised p-5">
          <h2 className="text-lg font-semibold tracking-tight nm-strong">
            Members
            <span className="ml-2 text-sm font-normal nm-muted">{members.length}</span>
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {members.map((m) => {
              const isLeader = m.userId === room.leader_id;
              const isSelf = m.userId === userId;
              return (
                <li
                  key={m.userId}
                  className="nm-row nm-song-row flex items-center justify-between gap-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${isLeader ? "nm-accent" : "nm-strong"}`}>
                      {m.name}
                      {isSelf && <span className="ml-1 text-xs nm-muted">(you)</span>}
                    </span>
                  </span>
                  {isLeader && (
                    <span className="nm-card nm-raised-sm rounded-full px-2 py-0.5 text-xs font-medium nm-accent">
                      Leader
                    </span>
                  )}
                  {room.isLeader && !isSelf && !isLeader && (
                    <button
                      type="button"
                      onClick={() => handoff(m.userId)}
                      disabled={busy}
                      className="nm-nav-button nm-raised-sm rounded-2xl px-3 py-1 text-xs font-medium nm-strong disabled:opacity-60"
                    >
                      Make leader
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <button
          type="button"
          onClick={leave}
          disabled={busy}
          className="nm-card nm-raised-sm min-h-11 rounded-2xl px-6 text-sm font-medium nm-strong disabled:opacity-60"
        >
          Leave room
        </button>
      </div>
    </main>
  );
}
