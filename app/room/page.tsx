"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Notice } from "@/components/notice";

function RoomEntry() {
  const router = useRouter();
  const params = useSearchParams();
  const codeParam = params.get("code");

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startRoom() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Couldn't create room");
      }
      const room = await res.json();
      router.push(`/room/${room.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create room");
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom(rawCode: string) {
    const trimmed = rawCode.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError("Enter a 6-character code");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Couldn't join room");
      }
      const room = await res.json();
      router.push(`/room/${room.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't join room");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (codeParam && codeParam.length === 6) {
      void joinRoom(codeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam]);

  return (
    <div className="flex flex-col gap-6">
      <section className="nm-card nm-raised p-6">
        <h1 className="text-2xl font-semibold tracking-tight nm-strong">Group listening</h1>
        <p className="mt-1 text-sm nm-muted">
          Start a room and share the code or QR, or join one with a code.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={startRoom}
            disabled={busy}
            className="nm-card nm-raised-sm inline-flex min-h-12 items-center justify-center rounded-2xl px-6 text-sm font-medium nm-strong disabled:opacity-60"
          >
            {busy ? "Working…" : "Start a room"}
          </button>
          <div className="flex gap-2">
            <span className="nm-field flex min-h-12 flex-1 items-center px-4">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-char code"
                maxLength={6}
                className="nm-search-input uppercase"
              />
            </span>
            <button
              type="button"
              onClick={() => joinRoom(code)}
              disabled={busy}
              className="nm-card nm-raised-sm rounded-2xl px-5 text-sm font-medium nm-strong disabled:opacity-60"
            >
              Join
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm nm-muted">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}

export default function RoomPage() {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
        <AppHeader showBack />
        <Suspense fallback={<div className="nm-well nm-inset h-24 animate-pulse rounded-2xl" />}>
          <RoomEntry />
        </Suspense>
      </div>
    </main>
  );
}
