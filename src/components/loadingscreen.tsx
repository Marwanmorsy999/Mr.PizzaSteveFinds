import React, { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let hideTimer: number;
    let showTimer: number;

    const intervalId = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, TIMINGS.messageInterval);

    const fadeTimer = window.setTimeout(() => {
      setFading(true);
      hideTimer = window.setTimeout(() => {
        setLoading(false);
        showTimer = window.setTimeout(() => {
          setShowContent(true);
        }, TIMINGS.contentDelay);
      }, TIMINGS.fadeDuration);
    }, TIMINGS.fadeStart);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(showTimer);
    };
  }, []);

  if (!loading) {
    return (
      <div className={`transition-opacity duration-700 ${showContent ? "opacity-100" : "opacity-0"}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at top, #f7f0e1 0%, #d7c6aa 35%, #8b5e3c 100%)",
      }}
    >
      <div className="relative flex flex-col items-center gap-6 px-6 pt-20">
        <ThriftTag />
        <BrandText messageIndex={messageIndex} />

        {/* Floating Badges */}
        <div className="absolute -left-12 top-36 rotate-[-12deg]">
          <div
            className="bg-red-400 border-4 border-black px-3 py-1 rounded-md text-xs font-black shadow-lg"
            style={{ animation: "float 3.2s ease-in-out infinite" }}
          >
            vintage
          </div>
        </div>

        <div className="absolute -right-12 bottom-6 rotate-[10deg]">
          <div
            className="bg-emerald-300 border-4 border-black px-3 py-1 rounded-md text-xs font-black shadow-lg"
            style={{ animation: "float 2.7s ease-in-out infinite 0.4s" }}
          >
            one of one
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
      `}</style>
    </div>
  );
}

function ThriftTag() {
  return (
    <div
      style={{
        position: "relative",
        width: 280,
        height: 200,
        background: "#f8e7c3",
        border: "4px solid #000",
        borderRadius: 22,
        boxShadow: "8px 8px 0 #000",
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
          filter: "drop-shadow(5px 5px 0px rgba(0,0,0,0.2))", mixBlendMode: "multiply",
        }}
      />

      {/* Dashed inner border */}
      <div
        style={{
          position: "absolute",
          top: 14, left: 14, right: 14, bottom: 14,
          border: "3px dashed #000",
          borderRadius: 16,
          pointerEvents: "none",
        }}
      />

      {/* Grommet hole */}
      <div
        style={{
          position: "absolute",
          top: 22, right: 22,
          width: 22, height: 22,
          borderRadius: "50%",
          border: "4px solid #000",
          background: "#fff",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 30, right: 30,
          width: 8, height: 8,
          borderRadius: "50%",
          background: "#000",
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
          color: "#d44a2d",
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
          fontSize: "0.95rem",
          color: "#000",
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
          fontSize: "1rem",
          color: "#000",
          background: "#f4d35e",
          border: "3px solid #000",
          borderRadius: 12,
          padding: "6px 12px",
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
          color: "#1f1a17",
          textShadow: "2px 2px #f4d35e",
          margin: 0,
          letterSpacing: "1px",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        Pizza Steve's Thrift
      </h1>

      <p
        key={messageIndex}
        style={{
          fontFamily: "Arial, sans-serif",
          background: "#fff8ea",
          border: "3px solid #000",
          borderRadius: 14,
          padding: "8px 14px",
          color: "#000",
          margin: 0,
          fontSize: "0.95rem",
          fontWeight: 800,
          boxShadow: "4px 4px 0 #000",
        }}
      >
        {MESSAGES[messageIndex]}
      </p>
    </div>
  );
}

