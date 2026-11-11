"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LibraryIcon } from "@/components/icons";

export function LibraryNavLink() {
  const pathname = usePathname();
  const active = pathname === "/library" || pathname.startsWith("/library/");

  return (
    <Link
      href="/library"
      aria-label="Library"
      aria-current={active ? "page" : undefined}
      className="nm-nav-button nm-raised-sm size-11"
    >
      <LibraryIcon />
    </Link>
  );
}
