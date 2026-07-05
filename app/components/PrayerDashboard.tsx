"use client";

import { useEffect, useState } from "react";
import type { PrayerEntry, TodayPrayers } from "../../lib/prayer";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "now";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function PrayerDashboard({ data }: { data: TodayPrayers }) {
  // `now` stays null through the server render and the first client render,
  // so the initial HTML matches exactly. Only after mount do we switch to a
  // live-ticking clock — this avoids hydration mismatches from Date.now().
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const entries = data.entries;

  // Before mount: use the server-computed snapshot. After mount: recompute
  // live, in case the page has been open across a prayer time.
  const past = now === null ? data.past : entries.filter((e) => e.timestamp <= now);
  const upcoming = now === null ? data.upcoming : entries.filter((e) => e.timestamp > now);
  const current = now === null ? data.current : past.length > 0 ? past[past.length - 1] : null;
  const next = now === null ? data.next : upcoming.length > 0 ? upcoming[0] : null;

  const progress = (() => {
    if (!next) return 100;
    const windowStart = current ? current.timestamp : entries[0].timestamp;
    const windowEnd = next.timestamp;
    const total = windowEnd - windowStart;
    if (total <= 0) return 100;
    const reference = now ?? windowStart;
    const elapsed = reference - windowStart;
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return Math.round(pct * 100) / 100; // avoid long float strings drifting between renders
  })();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight">{data.day}</h1>
        <p className="text-muted text-sm mt-1">
          {data.date} &middot; {data.hijri} AH
        </p>
      </div>

      {next && (
        <div className="border border-border p-6 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">
                {current ? `After ${current.name}` : "Next Prayer"}
              </p>
              <h2 className="text-3xl font-semibold mt-1">{next.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold tabular-nums">{next.time}</p>
              <p className="text-sm text-muted mt-1 tabular-nums" suppressHydrationWarning>
                in {formatCountdown(next.timestamp - (now ?? next.timestamp))}
              </p>
            </div>
          </div>

          <div className="mt-5 h-1 w-full bg-border overflow-hidden">
            <div
              className="h-full bg-foreground/70 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
              suppressHydrationWarning
            />
          </div>
        </div>
      )}

      {!next && current && (
        <div className="border border-border p-6 mb-4 text-center">
          <p className="text-xs text-muted uppercase tracking-wide">Today&apos;s Prayers Complete</p>
          <p className="text-lg font-medium mt-1">Last: {current.name} &middot; {current.time}</p>
        </div>
      )}

      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xs text-muted uppercase tracking-wide">Today</p>
        <p className="text-xs text-muted">
          {past.length} of {entries.length} passed
        </p>
      </div>

      <div className="border border-border divide-y divide-border">
        {entries.map((p) => {
          const isCurrent = p.name === current?.name;
          const isPast = past.some((e) => e.name === p.name);
          return (
            <div
              key={p.name}
              className={`flex items-center justify-between px-5 py-4 transition-colors ${
                isCurrent ? "bg-foreground/[0.03]" : ""
              } ${isPast && !isCurrent ? "opacity-45" : ""}`}
            >
              <div className="flex items-center gap-3">
                {isCurrent && (
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                )}
                <span className={`text-base ${isCurrent ? "font-semibold" : "font-medium"}`}>
                  {p.name}
                </span>
              </div>
              <span
                className={`text-lg tabular-nums ${
                  isCurrent ? "font-semibold" : "font-medium text-muted"
                }`}
              >
                {p.time}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}