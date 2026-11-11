"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { authenticate, signInWithGoogle, type AuthResult } from "@/app/login/actions";
import { Notice } from "@/components/notice";
import { loadLibrary } from "@/lib/library-store";
import { safeNext } from "@/lib/safe-next";

const fieldWrapper = "nm-field flex min-h-12 items-center px-4";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
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
      {params.get("oauth") === "failed" && (
        <p role="alert" className="text-sm nm-muted">
          Couldn&apos;t sign in with Google. Try again, or use your email and password.
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

      {!signingUp && (
        <Link href="/forgot-password" className="-mt-1 text-center text-sm nm-link">
          Forgot your password?
        </Link>
      )}

      <div className="flex items-center gap-3 text-xs nm-muted" aria-hidden>
        <span className="h-px flex-1 bg-current opacity-20" />
        or
        <span className="h-px flex-1 bg-current opacity-20" />
      </div>

      {/* A separate form: Google sign-in redirects, it doesn't post the email/password fields. */}
      <button
        type="submit"
        formAction={signInWithGoogle}
        formNoValidate
        name="next"
        value={next}
        className="nm-card nm-raised-sm flex min-h-12 items-center justify-center gap-3 rounded-2xl font-medium nm-strong"
      >
        <GoogleMark />
        Continue with Google
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
