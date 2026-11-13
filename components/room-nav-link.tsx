"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GroupIcon, LeaveIcon } from "@/components/icons";
import { clearCurrentRoom, useCurrentRoom } from "@/lib/room-store";

export function RoomNavLink() {
  const pathname = usePathname();
  const { room } = useCurrentRoom();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!room) return null;

  const active = pathname === `/room/${room.id}` || pathname.startsWith(`/room/${room.id}/`);

  async function leave() {
    setBusy(true);
    try {
      await fetch(`/api/rooms/${room!.id}/leave`, { method: "POST" });
    } finally {
      clearCurrentRoom();
      setBusy(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={leave}
          disabled={busy}
          className="nm-nav-button nm-raised-sm grid size-11 place-items-center nm-accent"
          aria-label="Confirm leave"
        >
          <LeaveIcon />
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="nm-nav-button nm-raised-sm grid size-8 place-items-center text-xs nm-muted"
          aria-label="Cancel leave"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/room/${room.id}`}
        aria-label="Group listening"
        aria-current={active ? "page" : undefined}
        className="nm-nav-button nm-raised-sm size-11 nm-accent relative"
      >
        <GroupIcon />
        <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--nm-accent)]" />
      </Link>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="nm-nav-button nm-raised-sm grid size-8 place-items-center nm-muted"
        aria-label="Leave room"
      >
        <LeaveIcon />
      </button>
    </div>
  );
}
