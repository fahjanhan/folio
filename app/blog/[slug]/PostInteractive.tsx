"use client";

import { useEffect, useState } from "react";
import { Share2, Check, ArrowUp } from "lucide-react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-50">
      <div
        className="h-full bg-fg transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg transition-colors p-1.5 rounded-sm hover:bg-gray-500/10"
      aria-label="Share this post"
    >
      {copied ? (
        <>
          <Check size={12} strokeWidth={1.5} />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Share2 size={12} strokeWidth={1.5} />
          <span>Share</span>
        </>
      )}
    </button>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 p-2.5 rounded-full border border-border bg-background hover:border-fg/40 transition-colors shadow-sm z-40"
      aria-label="Back to top"
    >
      <ArrowUp size={16} strokeWidth={1.5} />
    </button>
  );
}