"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { updatePassword, type AuthResult } from "@/app/login/actions";
import { loadLibrary } from "@/lib/library-store";

const fieldWrapper = "nm-field flex min-h-12 items-center px-4";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  // The recovery link carries this; it's verified on submit, not on load.
  const tokenHash = params.get("token_hash") ?? "";
  const [result, action, pending] = useActionState<AuthResult, FormData>(updatePassword, {
    status: "idle",
  });

  // Verifying the token signs them in, so once the password is set, go to the library.
  useEffect(() => {
    if (result.status === "done") void loadLibrary().then(() => router.replace("/library"));
  }, [result, router]);

  return (
    <form action={action} className="nm-card nm-raised flex flex-col gap-4 rounded-3xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight nm-strong">Set a new password</h1>
      <input type="hidden" name="token_hash" value={tokenHash} />
      <span className={fieldWrapper}>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          aria-label="New password"
          placeholder="New password"
          className="nm-search-input"
        />
      </span>
      {result.status === "error" && (
        <p role="alert" className="text-sm nm-muted">
          {result.message}
        </p>
      )}
      {result.status === "done" ? (
        <p className="text-sm nm-muted">Password updated. Taking you to your library…</p>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="nm-card nm-raised-sm min-h-12 rounded-2xl font-medium nm-strong disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save new password"}
        </button>
      )}
    </form>
  );
}
