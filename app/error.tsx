"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center gap-6 pb-12 pt-5">
        <div className="nm-card nm-raised flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight nm-strong">Something went wrong</h1>
          <p className="text-sm nm-muted">
            An unexpected error occurred. You can try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="nm-card nm-raised-sm mt-2 inline-flex min-h-11 items-center justify-center rounded-2xl px-6 text-sm font-medium nm-strong"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
