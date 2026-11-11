"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { authenticate, type AuthResult } from "@/app/login/actions";
import { Notice } from "@/components/notice";
import { loadLibrary } from "@/lib/library-store";

const fieldWrapper = "nm-field flex min-h-12 items-center px-4";

/** Only same-site paths, so a crafted link can't send people elsewhere after login. */
function safeNext(next: string | null): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/library";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [result, action, pending] = useActionState<AuthResult, FormData>(authenticate, {
    status: "idle",
  });
  const signingUp = mode === "signup";

  // A client navigation, not a reload, so whatever is playing keeps playing.
  useEffect(() => {
    if (result.status === "done") void loadLibrary().then(() => router.replace(next));
  }, [result, next, router]);

  if (result.status === "confirm") {
    return <Notice variant="neumorphic" title="Check your email">Open the confirmation link we sent you, then log in here.</Notice>;
  }

  return (
    <form
      action={action}
      className="nm-card nm-raised flex flex-col gap-4 rounded-3xl p-6"
    >
      <h1 className="text-2xl font-semibold tracking-tight nm-strong">
        {signingUp ? "Create your account" : "Log in"}
      </h1>
      {params.get("confirm") === "failed" && (
        <p role="alert" className="text-sm nm-muted">
          That confirmation link didn&apos;t work. Try logging in.
        </p>
      )}
      <input type="hidden" name="mode" value={mode} />
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
      <span className={fieldWrapper}>
        <input
          name="password"
          type="password"
          required
          minLength={signingUp ? 6 : undefined}
          autoComplete={signingUp ? "new-password" : "current-password"}
          aria-label="Password"
          placeholder="Password"
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
        {pending ? "One moment…" : signingUp ? "Sign up" : "Log in"}
      </button>
      <button
        type="button"
        onClick={() => setMode(signingUp ? "login" : "signup")}
        className="min-h-11 text-sm nm-link"
      >
        {signingUp ? "Already have an account? Log in" : "New here? Create an account"}
      </button>
    </form>
  );
}
