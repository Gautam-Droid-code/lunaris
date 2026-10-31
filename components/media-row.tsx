import Link from "next/link";
import { Cover } from "@/components/cover";
import type { Thumbnail } from "@/lib/music";

export type MediaItem = {
  key: string;
  href: string | null;
  title: string;
  subtitle?: string | null;
  thumbnails: Thumbnail[];
};

function MediaCard({ item, round }: { item: MediaItem; round: boolean }) {
  const content = (
    <>
      <Cover
        thumbnails={item.thumbnails}
        alt=""
        size={288}
        className={`aspect-square w-full shadow-raised-sm ${round ? "rounded-full" : "rounded-3xl"}`}
      />
      <span className="mt-3 block truncate text-sm font-medium">{item.title}</span>
      {item.subtitle && (
        <span className="block truncate text-xs text-text-muted">{item.subtitle}</span>
      )}
    </>
  );

  return item.href ? (
    <Link href={item.href} className="block rounded-3xl">
      {content}
    </Link>
  ) : (
    content
  );
}

export function MediaRow({
  title,
  items,
  round = false,
}: {
  title: string;
  items: MediaItem[];
  round?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <ul className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-3 pt-4">
        {items.map((item) => (
          <li key={item.key} className="w-32 shrink-0 sm:w-36">
            <MediaCard item={item} round={round} />
          </li>
        ))}
      </ul>
    </section>
  );
}
