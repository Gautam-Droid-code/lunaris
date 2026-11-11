/** Soft neumorphic placeholder rows for the search screen. */
export function SearchLoading({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Searching…" className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="nm-row nm-raised animate-pulse">
          <span className="nm-thumb nm-pressed-sm block size-12 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="nm-pressed-sm block h-3 w-2/3 rounded-full" />
            <span className="nm-pressed-sm mt-2 block h-2.5 w-1/3 rounded-full" />
          </span>
        </div>
      ))}
    </div>
  );
}
