import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Log in · Lunaris" };

export default function LoginPage() {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center gap-6 pb-12 pt-5">
        <AppHeader showBack />
        <div className="w-full max-w-md">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
