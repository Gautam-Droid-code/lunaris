"use client";

import { useEffect, useRef, useState } from "react";
import { useId } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const maskId = `splash-moon-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const prevOverflowRef = useRef<string>("");

  useEffect(() => {
    prevOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const start = Date.now();
    let triggered = false;
    let unmountTimer = 0;

    const beginFade = () => {
      if (triggered) return;
      triggered = true;
      const elapsed = Date.now() - start;
      const wait = Math.max(0, 1100 - elapsed);
      window.setTimeout(() => {
        document.body.style.overflow = prevOverflowRef.current;
        setFading(true);
        unmountTimer = window.setTimeout(() => setVisible(false), 600);
      }, wait);
    };

    if (document.readyState === "complete") {
      beginFade();
    } else {
      window.addEventListener("load", beginFade, { once: true });
    }

    return () => {
      window.removeEventListener("load", beginFade);
      window.clearTimeout(unmountTimer);
      document.body.style.overflow = prevOverflowRef.current;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`splash splash-overlay${fading ? " splash-fading" : ""}`}
      role="status"
      aria-label="Loading Lunaris"
    >
      <style>{`
        .splash {
          --splash-accent: #9d87ef;
        }
        .splash-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: var(--surface);
          display: grid;
          place-items: center;
          opacity: 1;
          transition: opacity 0.6s ease;
          pointer-events: auto;
        }
        .splash-overlay.splash-fading {
          opacity: 0;
          pointer-events: none;
        }
        .splash-stage {
          display: grid;
          place-items: center;
          gap: 1.5rem;
        }
        .splash-disc {
          position: relative;
          width: 134px;
          height: 134px;
          border-radius: 50%;
          background: var(--surface);
          box-shadow: 9px 9px 18px var(--shadow-dark), -9px -9px 18px var(--shadow-light);
          display: grid;
          place-items: center;
        }
        .splash-well {
          width: 106px;
          height: 106px;
          border-radius: 50%;
          background: var(--surface);
          box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
          display: grid;
          place-items: center;
        }
        .splash-moon {
          width: 64px;
          height: 64px;
          color: var(--splash-accent);
        }
        .splash-moon {
          transform-origin: center;
        }
        @media (prefers-reduced-motion: no-preference) {
          .splash-moon {
            animation: splash-breathe 2.6s ease-in-out infinite;
          }
          @keyframes splash-breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
          }
        }
        .splash-orbit {
          position: absolute;
          inset: 0;
        }
        .splash-moonlet {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--splash-accent);
          box-shadow: 0 0 8px var(--splash-accent);
        }
        @media (prefers-reduced-motion: no-preference) {
          .splash-orbit {
            animation: splash-orbit 1.7s linear infinite;
          }
          @keyframes splash-orbit {
            to { transform: rotate(360deg); }
          }
        }
        .splash-wordmark {
          display: flex;
          gap: 0.02em;
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--text);
          text-transform: lowercase;
        }
        .splash-letter {
          display: inline-block;
          opacity: 1;
          transform: none;
        }
        @media (prefers-reduced-motion: no-preference) {
          .splash-letter {
            opacity: 0;
            transform: translateY(8px);
            animation: splash-rise 0.5s ease forwards;
          }
          @keyframes splash-rise {
            to { opacity: 1; transform: translateY(0); }
          }
        }
        .splash-progress {
          width: 180px;
        }
        .splash-progress-track {
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: var(--surface);
          box-shadow: inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light);
          overflow: hidden;
        }
        .splash-progress-bar {
          height: 100%;
          width: 100%;
          border-radius: 999px;
          background: var(--splash-accent);
        }
        @media (prefers-reduced-motion: no-preference) {
          .splash-progress-bar {
            width: 40%;
            background: linear-gradient(90deg, var(--surface), var(--splash-accent), var(--surface));
            animation: splash-sweep 1.4s ease-in-out infinite;
          }
          @keyframes splash-sweep {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(350%); }
          }
        }
      `}</style>

      <div className="splash-stage">
        <div className="splash-disc" aria-hidden="true">
          <div className="splash-well">
            <svg
              className="splash-moon"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <defs>
                <mask id={maskId}>
                  <rect width="512" height="512" fill="black" />
                  <circle cx="256" cy="256" r="194.56" fill="white" />
                  <circle cx="332.8" cy="215.04" r="179.2" fill="black" />
                </mask>
              </defs>
              <g mask={`url(#${maskId})`}>
                <rect width="512" height="512" fill="currentColor" />
              </g>
            </svg>
          </div>
          <div className="splash-orbit" aria-hidden="true">
            <div className="splash-moonlet" />
          </div>
        </div>

        <div className="splash-wordmark" aria-hidden="true">
          {"lunaris".split("").map((ch, i) => (
            <span
              key={i}
              className="splash-letter"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {ch}
            </span>
          ))}
        </div>

        <div className="splash-progress" aria-hidden="true">
          <div className="splash-progress-track">
            <div className="splash-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
