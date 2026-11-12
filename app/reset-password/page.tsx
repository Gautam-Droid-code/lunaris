import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = { title: "New password · Lunaris" };

export default function ResetPasswordPage() {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center gap-6 pb-12 pt-5">
        <AppHeader showBack />
        <div className="w-full max-w-md">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
