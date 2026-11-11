/** Only same-site paths, so a crafted link can't send people elsewhere after login. */
export function safeNext(next: string | null | undefined): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/library";
}
