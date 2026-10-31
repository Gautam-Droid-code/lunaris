import type { ServiceErrorKind } from "@/lib/music";

export function Notice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div role="status" className="rounded-3xl p-6 text-center shadow-pressed">
      <p className="font-medium">{title}</p>
      {children && <p className="mt-1 text-sm text-text-muted">{children}</p>}
    </div>
  );
}

export function ServiceNotice({ kind }: { kind: ServiceErrorKind }) {
  return kind === "unreachable" ? (
    <Notice title="Can't reach the music service">
      Check that it’s running, then refresh this page.
    </Notice>
  ) : (
    <Notice title="YouTube Music isn't responding">Please try again in a moment.</Notice>
  );
}

export function LoadingCard({ label }: { label: string }) {
  return (
    <div role="status" className="animate-pulse rounded-3xl p-6 text-center shadow-pressed">
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}
