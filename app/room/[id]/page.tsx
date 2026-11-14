"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { CloseIcon } from "@/components/icons";
import { Cover } from "@/components/cover";
import { Notice } from "@/components/notice";
import { usePlayer } from "@/components/player-provider";
import { artistNames } from "@/lib/format";
import { clearCurrentRoom, refreshCurrentRoom, useCurrentRoom } from "@/lib/room-store";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { Track } from "@/lib/music";

export default function RoomScreen({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const router = useRouter();
  const { playTrack } = usePlayer();
  const { members } = useCurrentRoom();
  const [room, setRoom] = useState<{ id: string; code: string; leader_id: string; isLeader: boolean; group_playlist_id?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [copying, setCopying] = useState(false);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    let channel: ReturnType<ReturnType<typeof createSupabaseBrowser>["channel"]> | null = null;

    (async () => {
      const supabase = (await import("@/lib/supabase/client")).createSupabaseBrowser();
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data.user) setUserId(data.user.id);
      await refreshCurrentRoom();
      if (!mounted) return;
      const res = await fetch(`/api/rooms/${id}`);
      if (!res.ok) {
        setError("Room not found");
        setLoading(false);
        return;
      }
      const r = await res.json();
      if (!mounted) return;
      setRoom(r);
      setLoading(false);

      // Fetch playlist
      const plRes = await fetch(`/api/rooms/${id}/playlist`);
      if (plRes.ok) {
        const pl = await plRes.json();
        if (!mounted) return;
        setTracks(pl.tracks ?? []);
      }

      // Realtime subscription
      if (r.group_playlist_id) {
        channel = supabase
          .channel(`playlist:${r.group_playlist_id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "playlist_tracks", filter: `playlist_id=eq.${r.group_playlist_id}` },
            () => {
              void fetch(`/api/rooms/${id}/playlist`)
                .then((res) => res.json())
                .then((pl) => {
                  if (!mounted) return;
                  setTracks(pl.tracks ?? []);
                })
                .catch(() => {});
            },
          )
          .subscribe();
      }
    })();

    return () => {
      mounted = false;
      if (channel) {
        const supabase = createSupabaseBrowser();
        supabase.removeChannel(channel);
      }
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
      const res = await fetch(`/api/rooms/${id}`);
      if (res.ok) setRoom(await res.json());
      await refreshCurrentRoom();
    } finally {
      setBusy(false);
    }
  }

  async function removeTrack(videoId: string) {
    if (!id) return;
    await fetch(`/api/rooms/${id}/playlist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
    // refetch
    const res = await fetch(`/api/rooms/${id}/playlist`);
    if (res.ok) {
      const pl = await res.json();
      setTracks(pl.tracks ?? []);
    }
  }

  async function deleteAll() {
    if (!id || tracks.length === 0) return;
    if (!window.confirm("Remove all songs from the group playlist?")) return;
    setDeleting(true);
    try {
      for (const t of tracks) {
        await fetch(`/api/rooms/${id}/playlist`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: t.videoId }),
        });
      }
      const res = await fetch(`/api/rooms/${id}/playlist`);
      if (res.ok) {
        const pl = await res.json();
        setTracks(pl.tracks ?? []);
      }
    } finally {
      setDeleting(false);
    }
  }

  async function copyToLibrary() {
    if (!id) return;
    setCopying(true);
    setCopyMsg(null);
    try {
      const res = await fetch(`/api/rooms/${id}/playlist/copy`, { method: "POST" });
      if (!res.ok) throw new Error("Copy failed");
      setCopyMsg("Saved to your library");
    } catch {
      setCopyMsg("Couldn't save");
    } finally {
      setCopying(false);
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

  const r = room;
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

        {/* Group playlist */}
        <section className="nm-card nm-raised p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight nm-strong">Group playlist</h2>
            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="nm-nav-button nm-raised-sm inline-flex min-h-9 items-center gap-2 rounded-2xl px-4 text-xs font-medium nm-strong"
              >
                Add songs
              </Link>
              {room?.isLeader && tracks.length > 0 && (
                <button
                  type="button"
                  onClick={deleteAll}
                  disabled={deleting}
                  aria-label="Delete playlist"
                  className="nm-nav-button nm-raised-sm inline-flex min-h-9 items-center gap-2 rounded-2xl px-4 text-xs font-medium text-red-500 disabled:opacity-60"
                >
                  <CloseIcon className="size-3.5" />
                  {deleting ? "Removing…" : "Delete playlist"}
                </button>
              )}
              <button
                type="button"
                onClick={copyToLibrary}
                disabled={copying || tracks.length === 0}
                className="nm-card nm-raised-sm inline-flex min-h-9 items-center gap-2 rounded-2xl px-4 text-xs font-medium nm-strong disabled:opacity-60"
              >
                {copying ? "Saving…" : "Save to my library"}
              </button>
            </div>
          </div>
          {copyMsg && <p className="mt-2 text-xs nm-muted">{copyMsg}</p>}
          {tracks.length === 0 ? (
            <div className="nm-well nm-inset mt-3 flex min-h-[120px] flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="font-medium nm-strong">No songs yet</p>
              <p className="text-xs nm-muted">Add one from search.</p>
            </div>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {tracks.map((track, i) => (
                <li key={`${track.videoId}-${i}`} className="nm-row nm-song-row flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playTrack(track, tracks)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="nm-thumb nm-inset-sm block shrink-0 p-[2px]">
                      <Cover thumbnails={track.thumbnails} alt="" size={96} className="size-10 rounded-[8px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold nm-strong">{track.title ?? "Untitled"}</span>
                      <span className="mt-0.5 block truncate text-xs nm-muted">{artistNames(track.artists)}</span>
                    </span>
                    {track.duration && (
                      <span className="shrink-0 text-xs tabular-nums nm-muted">{track.duration}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTrack(track.videoId)}
                    aria-label={`Remove ${track.title ?? "track"}`}
                    className="nm-nav-button nm-raised-sm grid size-8 shrink-0 place-items-center"
                  >
                    <CloseIcon className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {leaveConfirm ? (
          <div className="nm-card nm-raised flex flex-col gap-2 p-4">
            <p className="text-sm nm-strong">Leave this room?</p>
            {tracks.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await copyToLibrary();
                  await leave();
                  setLeaveConfirm(false);
                }}
                disabled={busy || copying}
                className="nm-card nm-raised-sm min-h-11 rounded-2xl px-6 text-sm font-medium nm-strong disabled:opacity-60"
              >
                Save to my library & leave
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                void leave();
                setLeaveConfirm(false);
              }}
              disabled={busy}
              className="nm-card nm-raised-sm min-h-11 rounded-2xl px-6 text-sm font-medium nm-strong disabled:opacity-60"
            >
              Leave without saving
            </button>
            <button
              type="button"
              onClick={() => setLeaveConfirm(false)}
              className="nm-card nm-raised-sm min-h-11 rounded-2xl px-6 text-sm font-medium nm-muted"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (tracks.length > 0 ? setLeaveConfirm(true) : void leave())}
            disabled={busy}
            className="nm-card nm-raised-sm min-h-11 rounded-2xl px-6 text-sm font-medium nm-strong disabled:opacity-60"
          >
            Leave room
          </button>
        )}
      </div>
    </main>
  );
}
