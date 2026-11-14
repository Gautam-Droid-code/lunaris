"use client";

import Link from "next/link";
import { Suspense, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  BrowseIcon,
  HeartIcon,
  HomeIcon,
  LibraryIcon,
  SearchIcon,
  SettingsIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import { signOut } from "@/app/login/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoomNavLink } from "@/components/room-nav-link";
import { clearLibrary, useLibrary } from "@/lib/library-store";

function NavItem({
  href,
  label,
  icon,
  expanded,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  expanded: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`nm-nav-button flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
        active ? "nm-pressed-sm nm-accent" : "nm-raised-sm"
      }`}
    >
      <span className={`grid size-5 shrink-0 place-items-center ${active ? "nm-accent nm-nav-glow" : ""}`}>
        {icon}
      </span>
      <span className={`${expanded ? "block" : "hidden"} md:hidden lg:block`}>
        {label}
      </span>
      {expanded && <span className="hidden md:block lg:hidden">{label}</span>}
    </Link>
  );
}

export function AppSidebar() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
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
    <aside
      className={`hidden shrink-0 flex-col gap-4 p-3 md:flex md:w-16 lg:w-[250px] ${
        expanded ? "md:w-[250px]" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Lunaris home" className="inline-flex items-center">
          <Logo variant={expanded ? "full" : "mark"} size={32} />
        </Link>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label="Toggle sidebar"
          className="nm-nav-button nm-raised-sm grid size-8 place-items-center md:inline-flex lg:hidden"
        >
          {expanded ? "‹" : "›"}
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        <NavItem href="/" label="Listen Now" icon={<HomeIcon className="size-5" />} expanded={expanded} />
        <NavItem href="/browse" label="Browse" icon={<BrowseIcon className="size-5" />} expanded={expanded} />
        <NavItem href="/search" label="Search" icon={<SearchIcon className="size-5" />} expanded={expanded} />
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <RoomNavLink />
          </Suspense>
          {expanded && <span className="text-sm font-medium nm-strong">Group</span>}
        </div>
      </nav>

      <div className="flex flex-col gap-1">
        <p className={`px-3 text-xs font-semibold uppercase tracking-wider nm-muted ${expanded ? "block" : "hidden md:hidden lg:block"}`}>
          Your Library
        </p>
        <NavItem href="/library" label="Playlists" icon={<LibraryIcon className="size-5" />} expanded={expanded} />
        <NavItem href="/library#liked-songs" label="Favorite Songs" icon={<HeartIcon className="size-5" />} expanded={expanded} />
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {ready && user ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Account menu"
              className="nm-nav-button nm-raised-sm flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium"
            >
              <span className="nm-inset grid size-8 shrink-0 place-items-center rounded-full">
                <span className="text-xs nm-strong">{(user.email ?? "?").charAt(0).toUpperCase()}</span>
              </span>
              {expanded && (
                <span className="hidden truncate text-xs nm-muted md:block lg:block">
                  {user.email}
                </span>
              )}
            </button>
            {menuOpen && (
              <div className="nm-card nm-raised flex flex-col gap-1 p-2">
                <Link
                  href="/settings"
                  className="nm-nav-button nm-raised-sm flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium"
                >
                  <SettingsIcon className="size-4" />
                  <span>Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={logOut}
                  disabled={signingOut}
                  className="nm-nav-button nm-raised-sm flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium nm-strong disabled:opacity-60"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : ready ? (
          <Link
            href="/login"
            className="nm-card nm-raised-sm inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium nm-strong"
          >
            Log in
          </Link>
        ) : null}
        <ThemeToggle />
      </div>
    </aside>
  );
}
