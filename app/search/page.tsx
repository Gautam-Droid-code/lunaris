import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { LoadingCard } from "@/components/notice";
import { SearchBox } from "@/components/search-box";
import { SearchResults } from "@/components/search-results";

export const metadata: Metadata = { title: "Search · Lunaris" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-5 pb-32 pt-5">
      <AppHeader showBack />
      <Suspense fallback={<div className="h-20 rounded-full" />}>
        <SearchBox />
      </Suspense>
      <Suspense fallback={<LoadingCard label="Searching…" />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
