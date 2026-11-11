import Link from "next/link";
import { AppHeader } from "@/components/app-header";

export default function NotFound() {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center gap-6 pb-12 pt-5">
        <AppHeader showBack />
        <div className="nm-card nm-raised flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
          <p className="text-6xl font-semibold tracking-tight nm-muted">404</p>
          <h1 className="text-xl font-semibold tracking-tight nm-strong">Page not found</h1>
          <p className="text-sm nm-muted">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <Link
            href="/"
            className="nm-card nm-raised-sm mt-2 inline-flex min-h-11 items-center justify-center rounded-2xl px-6 text-sm font-medium nm-strong"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
