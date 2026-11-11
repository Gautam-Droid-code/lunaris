"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthResult } from "@/app/login/actions";
import { Notice } from "@/components/notice";

const fieldWrapper = "nm-field flex min-h-12 items-center px-4";

export function ForgotPasswordForm() {
  const [result, action, pending] = useActionState<AuthResult, FormData>(requestPasswordReset, {
    status: "idle",
  });

  if (result.status === "confirm") {
    return (
      <Notice variant="neumorphic" title="Check your email">
        If an account exists for that address, we&apos;ve sent a link to reset your password.{" "}
        <Link href="/login" className="nm-link">
          Back to log in
        </Link>
      </Notice>
    );
  }

  return (
    <form action={action} className="nm-card nm-raised flex flex-col gap-4 rounded-3xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight nm-strong">Reset your password</h1>
      <p className="text-sm nm-muted">
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>
      <span className={fieldWrapper}>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-label="Email"
          placeholder="Email"
          className="nm-search-input"
        />
      </span>
      {result.status === "error" && (
        <p role="alert" className="text-sm nm-muted">
          {result.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="nm-card nm-raised-sm min-h-12 rounded-2xl font-medium nm-strong disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <Link href="/login" className="min-h-11 text-center text-sm nm-link">
        Back to log in
      </Link>
    </form>
  );
}
