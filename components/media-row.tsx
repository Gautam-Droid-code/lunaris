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

function MediaCard({
  item,
  round,
  neumorphic,
}: {
  item: MediaItem;
  round: boolean;
  neumorphic: boolean;
}) {
  if (neumorphic) {
    const content = (
      <>
        <span
          className={`nm-inset block shrink-0 p-[2px] ${
            round ? "rounded-full" : "nm-thumb"
          }`}
        >
          <Cover
            thumbnails={item.thumbnails}
            alt=""
            size={288}
            className={`aspect-square w-full ${round ? "rounded-full" : "rounded-[10px]"}`}
          />
        </span>
        <span className="mt-2 block truncate text-sm font-semibold nm-strong">{item.title}</span>
        {item.subtitle && (
          <span className="block truncate text-xs nm-muted">{item.subtitle}</span>
        )}
      </>
    );

    return item.href ? (
      <Link
        href={item.href}
        className="nm-card nm-raised-sm block rounded-2xl p-3 transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
      >
        {content}
      </Link>
    ) : (
      <div className="nm-card nm-raised-sm rounded-2xl p-3">{content}</div>
    );
  }

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

/** Search-only row treatment that mirrors the Up-next list. */
function MediaListRow({ item, round }: { item: MediaItem; round: boolean }) {
  const content = (
    <>
      <span
        className={`nm-inset-sm block shrink-0 p-[2px] ${
          round ? "rounded-full" : "nm-thumb"
        }`}
      >
        <Cover
          thumbnails={item.thumbnails}
          alt=""
          size={96}
          className={`size-11 ${round ? "rounded-full" : "rounded-[10px]"}`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold nm-strong">{item.title}</span>
        {item.subtitle && (
          <span className="mt-0.5 block truncate text-xs nm-muted">{item.subtitle}</span>
        )}
      </span>
    </>
  );

  return item.href ? (
    <Link href={item.href} className="nm-row nm-raised">
      {content}
    </Link>
  ) : (
    <div className="nm-row nm-raised">{content}</div>
  );
}

export function MediaRow({
  title,
  items,
  round = false,
  variant = "cards",
  neumorphic = false,
}: {
  title: string;
  items: MediaItem[];
  round?: boolean;
  variant?: "cards" | "rows";
  neumorphic?: boolean;
}) {
  if (items.length === 0) return null;

  if (variant === "rows") {
    return (
      <section>
        <h2 className="mb-2 text-lg font-semibold tracking-tight nm-strong">{title}</h2>
        <ul className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-2">
          {items.map((item) => (
            <li key={item.key}>
              <MediaListRow item={item} round={round} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section>
      <h2 className={`text-lg font-semibold tracking-tight ${neumorphic ? "nm-strong" : ""}`}>
        {title}
      </h2>
      <ul className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-3 pt-4">
        {items.map((item) => (
          <li key={item.key} className="w-32 shrink-0 sm:w-36">
            <MediaCard item={item} round={round} neumorphic={neumorphic} />
          </li>
        ))}
      </ul>
    </section>
  );
}
