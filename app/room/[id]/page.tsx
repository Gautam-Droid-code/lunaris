"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { AppHeader } from "@/components/app-header";
import { Notice } from "@/components/notice";
import { clearCurrentRoom, getCurrentRoom, refreshCurrentRoom, useCurrentRoom } from "@/lib/room-store";

export default function RoomScreen({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const router = useRouter();
  const { room, members } = useCurrentRoom();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      const supabase = (await import("@/lib/supabase/client")).createSupabaseBrowser();
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data.user) setUserId(data.user.id);
      await refreshCurrentRoom();
      if (!mounted) return;
      if (!getCurrentRoom()) {
        // fallback: fetch directly
        const res = await fetch(`/api/rooms/${id}`);
        if (!res.ok) {
          setError("Room not found");
          setLoading(false);
          return;
        }
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function leave() {
    if (!id) return;
    setBusy(true);
    try {
      await fetch(`/api/rooms/${id}/leave`, { method: "POST" });
    } finally {
      clearCurrentRoom();
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
      await refreshCurrentRoom();
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

  if (error || !room || room.id !== id) {
    // if store room not loaded yet, try direct fetch state
    if (!room) {
      return (
        <main className="nm-screen min-h-dvh">
          <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
            <AppHeader showBack />
            <Notice variant="neumorphic" title={error ?? "Room not found"} />
          </div>
        </main>
      );
    }
  }

  const r = room!;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const joinUrl = `${origin}/room?code=${r.code}`;

  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
        <AppHeader showBack />
        <section className="nm-card nm-raised p-5">
          <p className="nm-eyebrow">Room code</p>
          <p className="mt-2 text-3xl font-semibold tracking-widest nm-strong">{r.code}</p>
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
              const isLeader = m.userId === r.leader_id;
              return (
                <li
                  key={m.userId}
                  className="nm-row nm-song-row flex items-center justify-between gap-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-semibold ${isLeader ? "nm-accent" : "nm-strong"}`}>
                      {m.name}
                    </span>
                  </span>
                  {isLeader && (
                    <span className="nm-card nm-raised-sm rounded-full px-2 py-0.5 text-xs font-medium nm-accent">
                      Leader
                    </span>
                  )}
                  {r.isLeader && m.userId !== userId && !isLeader && (
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
