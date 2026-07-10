"use client";

import { useState } from "react";

export default function Footer() {
  const [clicked, setClicked] = useState(false);

  const triggerBlink = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 400);
  };

  return (
    <footer className="flex-shrink-0 py-6 border-t">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <p className="text-[11px] text-muted">
          © {new Date().getFullYear()} — Yes, its a footer
        </p>

        <div
          onClick={triggerBlink}
          className={`group flex items-center gap-2 cursor-pointer p-2 -m-2`}
        >
          <span
            className={`w-3 h-3 rounded-full bg-fg/40 animate-blink group-hover:animate-blink-fast ${
              clicked ? "animate-blink-click" : ""
            }`}
          />
          <span className="w-6 h-3 rounded-full bg-fg/40" />
          <span
            className={`w-3 h-3 rounded-full bg-fg/40 animate-blink [animation-delay:2s] group-hover:animate-blink-fast ${
              clicked ? "animate-blink-click" : ""
            }`}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes blink {
          0%,
          92%,
          100% {
            transform: scaleY(1);
          }
          96% {
            transform: scaleY(0.15);
          }
        }
        @keyframes blink-fast {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.15);
          }
        }
        @keyframes blink-click {
          0%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.1);
          }
        }
        .animate-blink {
          animation: blink 4s ease-in-out infinite;
          transform-origin: center;
        }
        .animate-blink-fast {
          animation: blink-fast 0.6s ease-in-out infinite !important;
          transform-origin: center;
        }
        .animate-blink-click {
          animation: blink-click 0.4s ease-in-out !important;
          transform-origin: center;
        }
      `}</style>
    </footer>
  );
}