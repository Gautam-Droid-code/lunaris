import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { SearchBox } from "@/components/search-box";
import { SearchLoading } from "@/components/search-loading";
import { SearchResults } from "@/components/search-results";

export const metadata: Metadata = { title: "Search · Lunaris" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 pb-32 pt-5 md:max-w-4xl lg:max-w-5xl">
        <AppHeader showBack />
        <Suspense fallback={<div className="nm-search h-12" />}>
          <SearchBox />
        </Suspense>
        <Suspense fallback={<SearchLoading />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
