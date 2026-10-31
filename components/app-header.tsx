import Link from "next/link";
import { BackIcon, LibraryIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader({ showBack = false }: { showBack?: boolean }) {
  return (
    <header className="flex items-center justify-between">
      {showBack ? (
        <Link
          href="/"
          aria-label="Back to home"
          className="grid size-11 place-items-center rounded-full bg-surface shadow-raised-sm active:shadow-pressed"
        >
          <BackIcon />
        </Link>
      ) : (
        <span className="text-lg font-semibold tracking-tight">lunaris</span>
      )}
      <div className="flex items-center gap-3">
        <Link
          href="/library"
          aria-label="Library"
          className="grid size-11 place-items-center rounded-full bg-surface shadow-raised-sm active:shadow-pressed"
        >
          <LibraryIcon />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
