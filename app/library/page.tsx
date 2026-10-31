import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { LibraryView } from "@/components/library-view";

export const metadata: Metadata = { title: "Library · Lunaris" };

export default function LibraryPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 pb-32 pt-5">
      <AppHeader showBack />
      <LibraryView />
    </main>
  );
}
