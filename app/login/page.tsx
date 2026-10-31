import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Log in · Lunaris" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-5 pb-32 pt-5">
      <AppHeader showBack />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
