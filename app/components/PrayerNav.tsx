"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Cloud, MapPin, Loader2 } from "lucide-react";
import { PrayerCountdown } from "./PrayerCountdown";
import { LiveTime } from "./LiveTime";

type PrayerEntry = {
  name: string;
  time: string;
  timestamp: number;
};

type PrayerData = {
  date: string;
  day: string;
  hijri: string;
  entries: PrayerEntry[];
  past: PrayerEntry[];
  upcoming: PrayerEntry[];
  current: PrayerEntry | null;
  next: PrayerEntry | null;
  range: { min: string; max: string } | null;
  weather: { temp: number; humidity: number } | null;
  todayNext: PrayerEntry | null;
  todayCurrent: PrayerEntry | null;
};

function toKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return toKey(d);
}

function isSameDay(a: string, b: string) {
  return a === b;
}

function shortDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default function PrayerNav({ initialData }: { initialData: PrayerData }) {
  const today = toKey(new Date());
  const [dateKey, setDateKey] = useState(today);
  const [data, setData] = useState<PrayerData>(initialData);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const isToday = isSameDay(dateKey, today);
  const canGoBack = !data.range || dateKey > data.range.min;
  const canGoForward = !data.range || dateKey < data.range.max;

  const fetchDate = useCallback(async (key: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const id = ++requestIdRef.current;

    setTransitioning(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/prayer?date=${key}`, { signal: controller.signal });
      if (!res.ok) throw new Error("Failed to fetch");
      const result: PrayerData = await res.json();
      if (id !== requestIdRef.current) return;
      setData(result);
      setDateKey(key);
    } catch {
      // ignore aborted requests
    } finally {
      if (id !== requestIdRef.current) return;
      setLoading(false);
      setTransitioning(false);
    }
  }, []);

  const goToday = useCallback(() => {
    if (!isToday) fetchDate(today);
  }, [isToday, today, fetchDate]);

  const goPrev = useCallback(() => {
    if (canGoBack && !loading) fetchDate(addDays(dateKey, -1));
  }, [canGoBack, loading, dateKey, fetchDate]);

  const goNext = useCallback(() => {
    if (canGoForward && !loading) fetchDate(addDays(dateKey, 1));
  }, [canGoForward, loading, dateKey, fetchDate]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "t" || e.key === "T") goToday();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext, goToday]);

  // Swipe navigation
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(diff) > 60) {
        if (diff > 0) goPrev();
        else goNext();
      }
    },
    [goPrev, goNext]
  );

  return (
    <div
      className="flex flex-col h-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex-1">
        {/* Day + Time */}
        <div className="mb-8">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-medium tracking-tight">{data.day}</h1>
            <span className="text-2xl font-medium tracking-tight text-muted tabular-nums">
              <LiveTime />
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} strokeWidth={1.5} />
              {formatDateDisplay(data.date)} &middot; {data.hijri} AH
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} strokeWidth={1.5} />
              Al Ain
            </span>
            {data.weather && (
              <span className="flex items-center gap-1.5">
                <Cloud size={13} strokeWidth={1.5} />
                {data.weather.temp}&deg;C &middot; {data.weather.humidity}% humidity
              </span>
            )}
          </div>
        </div>

        {/* Next Prayer - always today's */}
        {data.todayNext && (
          <div className="border border-border p-6 mb-8">
            <p className="text-xs text-muted uppercase tracking-wide">Next Prayer</p>
            <div className="flex items-baseline justify-between mt-1">
              <h2 className="text-2xl font-semibold">{data.todayNext.name}</h2>
              <p className="text-3xl font-semibold tabular-nums">{data.todayNext.time}</p>
            </div>
            <div className="mt-2">
              <PrayerCountdown key={data.date} nextTimestamp={data.todayNext.timestamp} />
            </div>
          </div>
        )}

        {!data.todayNext && data.todayCurrent && (
          <div className="border border-border p-6 mb-8 text-center">
            <p className="text-xs text-muted uppercase tracking-wide">Today&apos;s Prayers Complete</p>
            <p className="text-lg font-medium mt-1">
              Last: {data.todayCurrent.name} &middot; {data.todayCurrent.time}
            </p>
          </div>
        )}

        {/* Prayer List */}
        <div
          className={`border border-border divide-y divide-border transition-opacity duration-150 ${
            transitioning ? "opacity-40" : "opacity-100"
          }`}
        >
          {data.entries.map((p) => {
            const isCurrent = isToday && p.name === data.current?.name;
            return (
              <div
                key={p.name}
                className={`flex items-center justify-between px-6 py-4 ${
                  isCurrent ? "bg-foreground/[0.03]" : ""
                }`}
              >
                <span
                  className={`text-base ${isCurrent ? "font-semibold" : "font-medium"}`}
                >
                  {p.name}
                </span>
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
      </div>

      {/* Navigation */}
      <div className="mt-8 border border-border py-2">
        <div className="flex">
          <button
            onClick={goPrev}
            disabled={!canGoBack || loading}
            className="flex-1 flex flex-col items-center gap-0.5 px-4 py-4 text-sm font-medium transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.08] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-fg disabled:opacity-30 disabled:cursor-not-allowed select-none"
          >
            <span className="flex items-center gap-1.5">
              <ChevronLeft size={16} strokeWidth={1.5} />
              Previous
            </span>
            <span className="text-xs text-muted font-normal tabular-nums">
              {loading ? "\u00A0" : shortDate(addDays(dateKey, -1))}
            </span>
          </button>

          <button
            onClick={goToday}
            disabled={isToday || loading}
            className={`flex flex-col items-center justify-center gap-0.5 px-5 py-4 text-sm font-medium border-x border-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-fg disabled:cursor-not-allowed select-none ${
              isToday
                ? "text-fg bg-foreground/[0.04]"
                : "text-muted hover:text-fg hover:bg-foreground/[0.04] active:bg-foreground/[0.08]"
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider">Today</span>
            {isToday && (
              <span className="w-1 h-1 rounded-full bg-fg/40" />
            )}
          </button>

          <button
            onClick={goNext}
            disabled={!canGoForward || loading}
            className="flex-1 flex flex-col items-center gap-0.5 px-4 py-4 text-sm font-medium transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.08] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-fg disabled:opacity-30 disabled:cursor-not-allowed select-none"
          >
            <span className="flex items-center gap-1.5">
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Next
                  <ChevronRight size={16} strokeWidth={1.5} />
                </>
              )}
            </span>
            <span className="text-xs text-muted font-normal tabular-nums">
              {loading ? "\u00A0" : shortDate(addDays(dateKey, 1))}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
