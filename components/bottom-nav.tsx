"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrowseIcon, HomeIcon, LibraryIcon, SearchIcon } from "@/components/icons";

const items = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/browse", label: "Browse", icon: BrowseIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/library", label: "Library", icon: LibraryIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-transparent bg-[var(--nm-bg)] px-2 lg:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium ${
              active ? "nm-accent" : "nm-muted"
            }`}
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
