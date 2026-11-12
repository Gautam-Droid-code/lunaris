"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GroupIcon } from "@/components/icons";
import { useLibrary } from "@/lib/library-store";

export function RoomNavLink() {
  const pathname = usePathname();
  const { ready, user } = useLibrary();
  if (!ready || !user) return null;

  const active = pathname === "/room" || pathname.startsWith("/room/");

  return (
    <Link
      href="/room"
      aria-label="Group listening"
      aria-current={active ? "page" : undefined}
      className="nm-nav-button nm-raised-sm size-11"
    >
      <GroupIcon />
    </Link>
  );
}
