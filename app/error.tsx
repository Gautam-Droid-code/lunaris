"use client";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-medium">Something went wrong</p>
      <button
        type="button"
        onClick={() => retry()}
        className="min-h-11 rounded-full bg-surface px-6 shadow-raised-sm active:shadow-pressed"
      >
        Try again
      </button>
    </main>
  );
}
