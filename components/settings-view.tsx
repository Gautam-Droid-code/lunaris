"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useTransition } from "react";
import { Cover } from "@/components/cover";
import { HeartIcon } from "@/components/icons";
import { signOut } from "@/app/login/actions";

import {
  getTheme,
  setTheme,
  subscribe as subscribeTheme,
  type Theme,
} from "@/components/theme-toggle";
import { clearLibrary, useLibrary } from "@/lib/library-store";

export function SettingsView() {
  const router = useRouter();
  const { ready, user } = useLibrary();
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "light" as Theme);
  const [signingOut, startSignOut] = useTransition();

  function logOut() {
    startSignOut(async () => {
      await signOut();
      clearLibrary();
      router.push("/");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Account */}
      <section className="nm-card nm-raised p-5">
        <h2 className="text-lg font-semibold tracking-tight nm-strong">Account</h2>
        {!ready ? (
          <div className="nm-well nm-inset mt-3 h-14 animate-pulse rounded-2xl" />
        ) : user ? (
          <div className="mt-4 flex items-center gap-4">
            <span className="nm-inset grid size-14 shrink-0 place-items-center rounded-full">
              <Cover thumbnails={[]} alt="" size={64} className="size-full rounded-full" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm nm-strong">{user.email}</p>
              <p className="text-xs nm-muted">Signed in</p>
            </div>
            <button
              type="button"
              onClick={logOut}
              disabled={signingOut}
              className="nm-card nm-raised-sm rounded-2xl px-4 py-2 text-sm font-medium nm-strong disabled:opacity-60"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm nm-muted">You&apos;re not signed in.</p>
            <Link
              href="/login"
              className="nm-card nm-raised-sm inline-flex min-h-11 items-center justify-center rounded-2xl px-6 text-sm font-medium nm-strong"
            >
              Log in
            </Link>
          </div>
        )}
      </section>

      {/* Appearance */}
      <section className="nm-card nm-raised p-5">
        <h2 className="text-lg font-semibold tracking-tight nm-strong">Appearance</h2>
        <p className="mt-1 text-xs nm-muted">Choose how Lunaris looks.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["light", "dark"] as Theme[]).map((option) => {
            const active = theme === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                aria-pressed={active}
                className={`nm-nav-button flex min-h-11 items-center justify-center rounded-2xl text-sm font-medium capitalize ${
                  active ? "nm-pressed-sm nm-accent" : "nm-raised-sm"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section className="nm-card nm-raised p-5">
        <h2 className="text-lg font-semibold tracking-tight nm-strong">About</h2>
        <div className="mt-3 flex items-center gap-3">
          <span className="nm-inset grid size-12 shrink-0 place-items-center rounded-2xl">
            <HeartIcon filled className="size-6 nm-accent" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold nm-strong">Lunaris</p>
            <p className="text-xs nm-muted">A soft, neomorphic music player.</p>
            <p className="text-xs nm-muted">Version 0.1.0</p>
          </div>
        </div>
      </section>
    </div>
  );
}
