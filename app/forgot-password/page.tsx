import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = { title: "Reset password · Lunaris" };

export default function ForgotPasswordPage() {
  return (
    <main className="nm-screen min-h-dvh">
      <div className="nm-container flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center gap-6 pb-12 pt-5">
        <AppHeader showBack />
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
