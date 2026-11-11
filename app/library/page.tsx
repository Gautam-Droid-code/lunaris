import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { LibraryView } from "@/components/library-view";

export const metadata: Metadata = { title: "Library · Lunaris" };

export default function LibraryPage() {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
        <AppHeader showBack />
        <LibraryView />
      </div>
    </main>
  );
}
