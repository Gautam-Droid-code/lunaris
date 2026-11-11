import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { SettingsView } from "@/components/settings-view";

export const metadata: Metadata = { title: "Settings · Lunaris" };

export default function SettingsPage() {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex flex-col gap-6 pb-32 pt-5">
        <AppHeader showBack />
        <SettingsView />
      </div>
    </main>
  );
}
