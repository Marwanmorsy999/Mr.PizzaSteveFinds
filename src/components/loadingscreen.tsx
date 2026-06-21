import React, { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";

const MESSAGES = [
  "Rummaging for gems...",
  "Sorting vintage heat...",
  "Fresh racks incoming...",
  "Deadstock loading...",
  "Pulling your next find...",
  "Rare pieces only...",
  "Curating the rack...",
  "Thrift treasure on deck...",
];

const TIMINGS = {
  messageInterval: 1100,
  fadeStart: 4200,
  fadeDuration: 700,
  contentDelay: 100,
};

export function LoadingScreen({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const hasLoadedBefore = typeof window !== "undefined" && window.sessionStorage.getItem("pizza-steve-loaded") === "true";
  const shouldSkipLoading = isAdminPage || hasLoadedBefore;

  const [loading, setLoading] = useState(!shouldSkipLoading);
  const [fading, setFading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (shouldSkipLoading) return;

    let hideTimer: number;

    const intervalId = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, TIMINGS.messageInterval);

    const fadeTimer = window.setTimeout(() => {
      setFading(true);
      hideTimer = window.setTimeout(() => {
        setLoading(false);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("pizza-steve-loaded", "true");
        }
      }, TIMINGS.fadeDuration);
    }, TIMINGS.fadeStart);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [shouldSkipLoading]);

  return (
    <>
      {children}
      {loading && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
            fading ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          style={{ background: "#0f0f0f" }}
        >
          <div className="relative flex flex-col items-center gap-6 px-6 pt-20">
            <ThriftTag />
            <BrandText messageIndex={messageIndex} />

            {/* Floating Badges */}
            <div className="absolute loading-badge-left top-36 rotate-[-12deg]">
              <div
                style={{
                  background: "#ff6a00",
                  border: "3px solid #fff",
                  color: "#fff",
                  fontFamily: "Impact, Arial Black, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  padding: "4px 10px",
                  borderRadius: 6,
                  boxShadow: "3px 3px 0 #fff",
                  animation: "float 3.2s ease-in-out infinite",
                }}
              >
                VINTAGE
              </div>
            </div>

            <div className="absolute loading-badge-right bottom-6 rotate-[10deg]">
              <div
                style={{
                  background: "#fff",
                  border: "3px solid #ff6a00",
                  color: "#ff6a00",
                  fontFamily: "Impact, Arial Black, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  padding: "4px 10px",
                  borderRadius: 6,
                  boxShadow: "3px 3px 0 #ff6a00",
                  animation: "float 2.7s ease-in-out infinite 0.4s",
                }}
              >
                ONE OF ONE
              </div>
            </div>
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(1deg); }
            }
            @keyframes tagSpin {
              0% { transform: rotate(-8deg) scale(1); }
              50% { transform: rotate(6deg) scale(1.03); }
              100% { transform: rotate(-8deg) scale(1); }
            }
            @media (max-width: 480px) {
              .loading-badge-left {
                left: -8px !important;
              }
              .loading-badge-right {
                right: -8px !important;
              }
            }
            @media (min-width: 481px) {
              .loading-badge-left {
                left: -48px !important;
              }
              .loading-badge-right {
                right: -48px !important;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

function ThriftTag() {
  return (
    <div
      style={{
        position: "relative",
        width: 280,
        height: 200,
        background: "#1a1a1a",
        border: "3px solid #ff6a00",
        borderRadius: 22,
        boxShadow: "6px 6px 0 #ff6a00",
        animation: "tagSpin 4s ease-in-out infinite",
      }}
    >
      <img
        src="/pizza-steve.png"
        alt="Pizza Steve"
        style={{
          position: "absolute",
          top: "-75px",
          left: "-15px",
          width: "165px",
          height: "auto",
          zIndex: 10,
          filter: "drop-shadow(4px 4px 0px rgba(255,106,0,0.5))",
        }}
      />

      {/* Dashed inner border */}
      <div
        style={{
          position: "absolute",
          top: 14, left: 14, right: 14, bottom: 14,
          border: "2px dashed #ff6a00",
          borderRadius: 16,
          pointerEvents: "none",
          opacity: 0.4,
        }}
      />

      {/* Grommet hole */}
      <div
        style={{
          position: "absolute",
          top: 22, right: 22,
          width: 22, height: 22,
          borderRadius: "50%",
          border: "3px solid #ff6a00",
          background: "#0f0f0f",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 30, right: 30,
          width: 8, height: 8,
          borderRadius: "50%",
          background: "#ff6a00",
        }}
      />

      {/* THRIFT text */}
      <div
        style={{
          position: "absolute",
          left: 22, top: 52,
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: "2.6rem",
          lineHeight: 1,
          color: "#ff6a00",
          textShadow: "2px 2px #000",
        }}
      >
        THRIFT
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          left: 24, top: 104,
          fontFamily: "Arial, sans-serif",
          fontWeight: 900,
          fontSize: "0.85rem",
          color: "#aaa",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        handpicked vintage finds
      </div>

      {/* Loading badge */}
      <div
        style={{
          position: "absolute",
          left: 24, bottom: 18,
          fontFamily: "Arial, sans-serif",
          fontWeight: 900,
          fontSize: "0.9rem",
          color: "#000",
          background: "#ff6a00",
          border: "none",
          borderRadius: 10,
          padding: "5px 12px",
          display: "inline-block",
        }}
      >
        loading the rack...
      </div>
    </div>
  );
}

function BrandText({ messageIndex }: { messageIndex: number }) {
  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <h1
        style={{
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: "2rem",
          color: "#fff",
          margin: 0,
          letterSpacing: "2px",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        MR. PIZZA STEVE <span style={{ color: "#ff6a00" }}>FINDS</span>
      </h1>

      <p
        key={messageIndex}
        style={{
          fontFamily: "Arial, sans-serif",
          background: "#1a1a1a",
          border: "2px solid #ff6a00",
          borderRadius: 10,
          padding: "8px 14px",
          color: "#fff",
          margin: 0,
          fontSize: "0.9rem",
          fontWeight: 700,
          boxShadow: "3px 3px 0 #ff6a00",
        }}
      >
        {MESSAGES[messageIndex]}
      </p>
    </div>
  );
}