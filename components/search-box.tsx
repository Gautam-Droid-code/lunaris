"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SearchIcon } from "@/components/icons";

const SEARCH_DELAY_MS = 350;
const SUGGEST_DELAY_MS = 200;

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const q = value.trim();
    if (q === urlQuery) return;

    const timer = setTimeout(() => {
      startTransition(() => {
        router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
      });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [value, urlQuery, router]);

  useEffect(() => {
    const q = value.trim();
    if (!q) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/suggestions?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (response.ok) setSuggestions(await response.json());
      } catch {
        // Suggestions are optional, so search keeps working without them.
      }
    }, SUGGEST_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  return (
    <div>
      <label className="flex min-h-12 items-center gap-3 rounded-full px-5 shadow-pressed focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-accent">
        <SearchIcon className="size-5 shrink-0 text-text-muted" />
        <span className="sr-only">Search songs, albums, artists and playlists</span>
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          list="search-suggestions"
          autoComplete="off"
          autoFocus
          placeholder="songs, albums, artists"
          className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-text-muted"
        />
        <datalist id="search-suggestions">
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </label>
      <p aria-live="polite" className="mt-2 h-4 px-5 text-xs text-text-muted">
        {isPending ? "Searching…" : ""}
      </p>
    </div>
  );
}
