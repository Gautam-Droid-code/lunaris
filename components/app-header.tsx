import Link from "next/link";
import { BackIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader({ showBack = false }: { showBack?: boolean }) {
  return (
    <header className="nm-nav-bar">
      {showBack ? (
        <Link
          href="/browse"
          aria-label="Back to browse"
          className="nm-nav-button nm-raised-sm size-11"
        >
          <BackIcon />
        </Link>
      ) : (
        <Link href="/" aria-label="Lunaris home" className="inline-flex items-center">
          <Logo variant="full" size={32} />
        </Link>
      )}
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
