
import { useState, useEffect } from "react";


const MESSAGES = [
  "Preheating the oven...",
  "Digging through the racks...",
  "Kneading the dough...",
  "Finding gems...",
  "Slicing it up...",
];

export function LoadingScreen({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 500);

    const endTimer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => setShowContent(true), 50);
      }, 800);
    }, 2800);

    return () => {
      clearInterval(msgInterval);
      clearTimeout(endTimer);
    };
  }, []);

  if (!loading) {
    return (
      <div
        className={`transition-opacity duration-700 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-800 ${
          fading ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        {/* Subtle warm glow behind pizza */}
        <div className="pointer-events-none absolute inset-0 noise-bg opacity-40" />

        <div className="relative flex flex-col items-center gap-8">
          {/* Pizza slices spinner */}
          <div className="relative h-40 w-40 sm:h-52 sm:w-52">
            {/* Steam particles */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="steam-particle" />
              <div className="steam-particle steam-delay-1" />
              <div className="steam-particle steam-delay-2" />
            </div>

            {/* 5 pizza slices arranged as a pie */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`slice slice-${i}`}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "50%",
                  height: "50%",
                  transformOrigin: "0% 0%",
                  transform: `rotate(${i * 72}deg)`,
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full overflow-visible"
                >
                  <defs>
                    <pattern
                      id={`pattern-${i}`}
                      patternUnits="userSpaceOnUse"
                      width="8"
                      height="8"
                    >
                      {i % 3 === 0 && (
                        <>
                          <rect width="8" height="8" fill="oklch(0.72 0.21 45)" />
                          <line x1="0" y1="4" x2="8" y2="4" stroke="oklch(0.14 0.012 60)" strokeWidth="1.5" />
                        </>
                      )}
                      {i % 3 === 1 && (
                        <>
                          <rect width="8" height="8" fill="oklch(0.62 0.24 27)" />
                          <circle cx="2" cy="2" r="1" fill="oklch(0.85 0.18 90)" />
                          <circle cx="6" cy="6" r="1" fill="oklch(0.85 0.18 90)" />
                        </>
                      )}
                      {i % 3 === 2 && (
                        <>
                          <rect width="8" height="8" fill="oklch(0.85 0.18 90)" />
                          <line x1="0" y1="0" x2="8" y2="8" stroke="oklch(0.14 0.012 60)" strokeWidth="1" />
                        </>
                      )}
                    </pattern>
                  </defs>
                  <path
                    d="M 0 0 L 100 0 A 100 100 0 0 1 30.9 95.1 Z"
                    fill={`url(#pattern-${i})`}
                    stroke="oklch(0.98 0.01 90 / 0.25)"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            ))}

            {/* Center logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="logo-pop relative z-10">
                <img

                  alt="Mr. Pizza Steve Finds"
                  className="h-20 w-auto sm:h-28"
                />
              </div>
            </div>
          </div>

          {/* Brand text */}
          <div className="flex flex-col items-center gap-3">
            <h1 className="font-display text-xl uppercase tracking-[0.2em] text-foreground sm:text-2xl">
              Mr. Pizza Steve
            </h1>
            <p
              key={messageIndex}
              className="font-sans text-sm text-muted-foreground sm:text-base"
            >
              {MESSAGES[messageIndex]}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loadBar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .slice {
          opacity: 0;
          animation: sliceIn 0.6s ease-out forwards;
        }
        .slice-0 { animation-delay: 0.2s; }
        .slice-1 { animation-delay: 0.4s; }
        .slice-2 { animation-delay: 0.6s; }
        .slice-3 { animation-delay: 0.8s; }
        .slice-4 { animation-delay: 1.0s; }

        @keyframes sliceIn {
          0% {
            opacity: 0;
            transform: rotate(var(--base-rot, 0deg)) translateX(-30px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: rotate(var(--base-rot, 0deg)) translateX(0) scale(1);
          }
        }

        .slice-0 { --base-rot: 0deg; }
        .slice-1 { --base-rot: 72deg; }
        .slice-2 { --base-rot: 144deg; }
        .slice-3 { --base-rot: 216deg; }
        .slice-4 { --base-rot: 288deg; }

        .logo-pop {
          opacity: 0;
          transform: scale(0.5);
          animation: logoPop 0.5s ease-out 1.4s forwards;
        }

        @keyframes logoPop {
          0% { opacity: 0; transform: scale(0.5); }
          60% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }

        .steam-particle {
          position: absolute;
          width: 8px;
          height: 20px;
          background: oklch(0.98 0.01 90 / 0.15);
          border-radius: 50%;
          filter: blur(4px);
          animation: steamRise 2s ease-out infinite;
          left: 50%;
          transform: translateX(-50%);
        }
        .steam-delay-1 {
          animation-delay: 0.6s;
          left: calc(50% - 12px);
        }
        .steam-delay-2 {
          animation-delay: 1.2s;
          left: calc(50% + 12px);
        }

        @keyframes steamRise {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          30% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-40px) scale(1.6);
          }
        }
      `}</style>
    </>
  );
}

