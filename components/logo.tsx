"use client";

import { useId } from "react";

export function Logo({
  variant = "full",
  size = 32,
  className,
}: {
  variant?: "mark" | "full";
  size?: number;
  className?: string;
}) {
  const maskId = `luCr-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span
        className="nm-nav-button nm-raised-sm grid shrink-0 place-items-center rounded-full"
        style={{ width: size, height: size, background: "var(--nm-bg)" }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          width={size * 0.72}
          height={size * 0.72}
          aria-hidden="true"
        >
          <ellipse
            cx="50"
            cy="50"
            rx="47"
            ry="17.5"
            fill="none"
            stroke="var(--nm-shadow-dark)"
            strokeWidth="1.6"
            transform="rotate(-28 50 50)"
          />
          <defs>
            <mask id={maskId}>
              <rect width="100" height="100" fill="black" />
              <circle cx="50" cy="50" r="38" fill="white" />
              <circle cx="65" cy="42" r="35" fill="black" />
            </mask>
          </defs>
          <g
            style={{
              filter:
                "drop-shadow(-2px -2px 2px var(--nm-shadow-light)) drop-shadow(2px 2px 3px var(--nm-shadow-dark))",
            }}
          >
            <g mask={`url(#${maskId})`}>
              <rect width="100" height="100" fill="var(--nm-bg)" />
            </g>
          </g>
          <path
            d="M17.1 69 A38 38 0 0 1 17.1 31"
            fill="none"
            stroke="var(--nm-accent)"
            strokeWidth="2.6"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 3px var(--nm-accent))" }}
          />
          <circle
            cx="70"
            cy="23"
            r="4.4"
            fill="var(--nm-accent)"
            style={{ filter: "drop-shadow(0 0 5px var(--nm-accent))" }}
          />
        </svg>
      </span>
      {variant === "full" && <span className="nm-nav-wordmark">lunaris</span>}
    </span>
  );
}
