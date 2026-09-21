"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Cloud, MapPin, Loader2, Sunrise, Moon } from "lucide-react";
import { PrayerCountdown } from "./PrayerCountdown";
import { LiveTime } from "./LiveTime";

type AstroInfo = {
  sunrise: string | null;
  sunset: string | null;
  moonrise: string | null;
  moonset: string | null;
  moonPhase: number | null;
};

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
  weather: { temp: number; humidity: number; astro: AstroInfo } | null;
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

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi Al Awwal",
  "Rabi Al Thani",
  "Jumada Al Ula",
  "Jumada Al Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul-Qi'dah",
  "Dhul-Hijjah",
];

function formatHijri(hijri: string) {
  const [day, month, year] = hijri.split("/").map(Number);
  if (!day || !month || !year || month < 1 || month > 12) return hijri;
  return `${day} ${HIJRI_MONTHS[month - 1]} ${year}`;
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

function formatTime(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Dubai",
  });
}

function moonPhaseName(phase: number | null) {
  if (phase === null) return null;
  if (phase < 0.06 || phase >= 0.94) return "New Moon";
  if (phase < 0.19) return "Waxing Crescent";
  if (phase < 0.31) return "First Quarter";
  if (phase < 0.44) return "Waxing Gibbous";
  if (phase < 0.56) return "Full Moon";
  if (phase < 0.69) return "Waning Gibbous";
  if (phase < 0.81) return "Last Quarter";
  return "Waning Crescent";
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

  const astro = data.weather?.astro;
  const sunTimes = astro && {
    sunrise: formatTime(astro.sunrise),
    sunset: formatTime(astro.sunset),
    moonPhase: moonPhaseName(astro.moonPhase),
    moonrise: formatTime(astro.moonrise),
    moonset: formatTime(astro.moonset),
  };

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
              {formatDateDisplay(data.date)} &middot; {formatHijri(data.hijri)} AH
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} strokeWidth={1.5} />
              Al Ain
            </span>
          </div>

          {/* Weather + Sun + Moon */}
          {(data.weather || sunTimes) && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 divide-y divide-border/60 sm:divide-y-0 sm:divide-x border border-border/60">
              {data.weather && (
                <div className="p-4 flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted uppercase tracking-wide">
                    <Cloud size={13} strokeWidth={1.5} />
                    Weather
                  </span>
                  <span className="text-lg font-medium tabular-nums">
                    {data.weather.temp}&deg;C
                  </span>
                  <span className="text-xs text-muted">{data.weather.humidity}% humidity</span>
                </div>
              )}

              {sunTimes && (
                <div className="p-4 flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted uppercase tracking-wide">
                    <Sunrise size={13} strokeWidth={1.5} />
                    Sun
                  </span>
                  <span className="text-lg font-medium tabular-nums">
                    <span className="text-fg/90">{sunTimes.sunrise ?? "—"}</span>
                    <span className="text-muted"> · </span>
                    <span className="text-fg/90">{sunTimes.sunset ?? "—"}</span>
                  </span>
                  <span className="text-xs text-muted">Rise / Set</span>
                </div>
              )}

              {sunTimes && (
                <div className="p-4 flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted uppercase tracking-wide">
                    <Moon size={13} strokeWidth={1.5} />
                    Moon
                  </span>
                  <span className="text-lg font-medium">
                    {sunTimes.moonPhase ?? "—"}
                  </span>
                  <span className="text-xs text-muted">
                    {sunTimes.moonrise && sunTimes.moonset ? (
                      <>Rises {sunTimes.moonrise} · Sets {sunTimes.moonset}</>
                    ) : (
                      <>&nbsp;</>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
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
                  className={`text-base ${isCurrent ? "font-semibold underline underline-offset-4 decoration-1" : "font-medium"}`}
                >
                  {p.name}
                </span>
                <span
                  className={`text-lg tabular-nums ${
                    isCurrent ? "font-semibold underline underline-offset-4 decoration-1" : "font-medium text-muted"
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
