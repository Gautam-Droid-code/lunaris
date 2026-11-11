import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { QueueView } from "@/components/queue-view";

export const metadata: Metadata = { title: "Queue · Lunaris" };

export default function QueuePage() {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
        <AppHeader showBack />
        <QueueView />
      </div>
    </main>
  );
}
