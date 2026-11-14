"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  BrowseIcon,
  GroupIcon,
  HeartIcon,
  HomeIcon,
  LeaveIcon,
  LibraryIcon,
  SearchIcon,
  SettingsIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import { signOut } from "@/app/login/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentRoom, leaveRoom } from "@/lib/room-store";
import { clearLibrary, useLibrary } from "@/lib/library-store";

function NavItem({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <div className="group relative">
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        style={
          active
            ? { background: "linear-gradient(135deg, var(--nm-accent), var(--nm-accent-deep))", color: "#1b1b21" }
            : undefined
        }
        className={`nm-nav-button grid size-12 place-items-center rounded-full transition-transform duration-200 ${
          active ? "" : "nm-raised-sm"
        }`}
      >
        {icon}
      </Link>
      <span
        className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 translate-x-2 rounded-2xl px-3 py-1.5 text-xs font-medium opacity-0 transition-all duration-[250ms] ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none nm-card nm-raised-sm"
        aria-hidden="true"
      >
        {label}
      </span>
    </div>
  );
}

function GroupRow() {
  const router = useRouter();
  const pathname = usePathname();
  const { room } = useCurrentRoom();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const href = room ? `/room/${room.id}` : "/room";
  const active = room
    ? pathname === href || pathname.startsWith(href + "/")
    : pathname === "/room";

  async function leave() {
    if (!room) return;
    setBusy(true);
    try {
      await leaveRoom(room.id);
    } finally {
      setBusy(false);
      setConfirming(false);
      if (pathname.startsWith("/room")) router.push("/browse");
    }
  }

  return (
    <div className="group relative">
      <Link
        href={href}
        aria-label="Group listening"
        aria-current={active ? "page" : undefined}
        style={
          active
            ? { background: "linear-gradient(135deg, var(--nm-accent), var(--nm-accent-deep))", color: "#1b1b21" }
            : undefined
        }
        className={`nm-nav-button grid size-12 place-items-center rounded-full transition-transform duration-200 ${
          active ? "" : "nm-raised-sm"
        }`}
      >
        <GroupIcon className="size-5" />
        {room && <span className="absolute right-1 top-1 size-2 rounded-full bg-[#1b1b21]" />}
      </Link>
      <span
        className="pointer-events-none absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 translate-x-2 rounded-2xl px-3 py-1.5 text-xs font-medium opacity-0 transition-all duration-[250ms] ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none nm-card nm-raised-sm"
        aria-hidden="true"
      >
        Group
      </span>
      {room && (
        <div className="mt-1 flex justify-center">
          {confirming ? (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={leave}
                disabled={busy}
                aria-label="Confirm leave"
                className="nm-nav-button nm-raised-sm grid size-7 place-items-center nm-accent"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                aria-label="Cancel leave"
                className="nm-nav-button nm-raised-sm grid size-7 place-items-center text-xs nm-muted"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label="Leave room"
              className="nm-nav-button nm-raised-sm grid size-7 place-items-center nm-muted"
            >
              <LeaveIcon className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function AppSidebar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const { ready, user } = useLibrary();

  function logOut() {
    startSignOut(async () => {
      await signOut();
      clearLibrary();
      router.push("/");
    });
  }

  return (
    <aside className="hidden shrink-0 flex-col items-center gap-3 p-3 md:flex md:w-[72px]">
      <Link href="/" aria-label="Lunaris home" className="inline-flex items-center">
        <Logo variant="mark" size={32} />
      </Link>
      <nav className="flex flex-col items-center gap-2">
        <NavItem href="/" label="Listen Now" icon={<HomeIcon className="size-5" />} />
        <NavItem href="/browse" label="Browse" icon={<BrowseIcon className="size-5" />} />
        <NavItem href="/search" label="Search" icon={<SearchIcon className="size-5" />} />
        <GroupRow />
      </nav>
      <div className="flex flex-col items-center gap-2">
        <NavItem href="/library" label="Playlists" icon={<LibraryIcon className="size-5" />} />
        <NavItem href="/library#liked-songs" label="Favorite Songs" icon={<HeartIcon className="size-5" />} />
      </div>
      <div className="mt-auto flex flex-col items-center gap-2">
        {ready && user ? (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Account menu"
              className="nm-nav-button nm-raised-sm grid size-10 place-items-center"
            >
              <span className="text-xs nm-strong">{(user.email ?? "?").charAt(0).toUpperCase()}</span>
            </button>
            {menuOpen && (
              <div className="nm-card nm-raised flex flex-col gap-1 p-2">
                <Link href="/settings" className="nm-nav-button nm-raised-sm flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium">
                  <SettingsIcon className="size-4" />
                  <span>Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={logOut}
                  disabled={signingOut}
                  className="nm-nav-button nm-raised-sm flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium nm-strong disabled:opacity-60"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : ready ? (
          <Link href="/login" aria-label="Log in" className="nm-nav-button nm-raised-sm grid size-10 place-items-center">
            <span className="text-xs nm-strong">in</span>
          </Link>
        ) : null}
        <ThemeToggle />
      </div>
    </aside>
  );
}
