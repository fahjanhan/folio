import fs from "fs";
import path from "path";

export type PrayerDay = {
  date: string; // YYYY-MM-DD
  day: string;
  hijri: string;
  Fajr: string;
  Shurooq: string;
  Duhur: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export type PrayerEntry = {
  name: string;
  time: string; // "HH:MM AM/PM"
  timestamp: number; // ms, for sorting/comparison
};

export type TodayPrayers = {
  date: string;
  day: string;
  hijri: string;
  entries: PrayerEntry[]; // all 6 prayers for today, in order, with timestamps
  past: PrayerEntry[];
  upcoming: PrayerEntry[];
  current: PrayerEntry | null; // the most recently passed prayer (active window)
  next: PrayerEntry | null; // the next upcoming prayer
};

const PRAYER_NAMES = ["Fajr", "Shurooq", "Duhur", "Asr", "Maghrib", "Isha"] as const;

const TIMEZONE = "Asia/Dubai";
const TZ_OFFSET = "+04:00";

// Folder containing prayers-YYYY-MM.json files, e.g. app/data/prayers-2026-07.json
const DATA_DIR = path.join(process.cwd(), "app", "data");
const FILE_PATTERN = /^prayers-\d{4}-\d{2}\.json$/;

/**
 * Reads every prayers-YYYY-MM.json file in DATA_DIR and merges them into
 * one sorted array. Adding a new month's file requires no code changes.
 */
let _cachedData: PrayerDay[] | null = null;

function loadAllPrayerData(): PrayerDay[] {
  if (_cachedData) return _cachedData;

  let filenames: string[];
  try {
    filenames = fs.readdirSync(DATA_DIR).filter((f) => FILE_PATTERN.test(f));
  } catch {
    throw new Error(`Could not read prayer data directory: ${DATA_DIR}`);
  }

  if (filenames.length === 0) {
    throw new Error(
      `No prayers-YYYY-MM.json files found in ${DATA_DIR}. Expected files like prayers-2026-07.json.`
    );
  }

  const all: PrayerDay[] = [];
  for (const filename of filenames) {
    const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
    const parsed = JSON.parse(raw) as PrayerDay[];
    all.push(...parsed);
  }

  all.sort((a, b) => a.date.localeCompare(b.date));
  _cachedData = all;
  return all;
}

/**
 * Converts a "hh:mm AM/PM" string + a date (YYYY-MM-DD) into a Date object.
 */
function toTimestamp(dateStr: string, timeStr: string): number {
  const [time, meridiem] = timeStr.split(" ");
  const [hoursRaw, minutesRaw] = time.split(":").map(Number);
  let hours = hoursRaw % 12;
  if (meridiem?.toUpperCase() === "PM") hours += 12;

  return new Date(
    `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutesRaw).padStart(2, "0")}:00${TZ_OFFSET}`
  ).getTime();
}

/**
 * Returns today's date as YYYY-MM-DD in local time.
 */
function todayKey(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

function dateToTimestamp(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00${TZ_OFFSET}`).getTime();
}

export async function getPrayerTimesForDate(dateStr: string): Promise<TodayPrayers> {
  const data = loadAllPrayerData();
  const key = dateStr;

  const todayEntry =
    data.find((d) => d.date === key) ??
    data.reduce((closest, d) =>
      Math.abs(dateToTimestamp(d.date) - dateToTimestamp(key)) <
      Math.abs(dateToTimestamp(closest.date) - dateToTimestamp(key))
        ? d
        : closest
    );

  const now = Date.now();

  const entries: PrayerEntry[] = PRAYER_NAMES.map((name) => ({
    name,
    time: todayEntry[name],
    timestamp: toTimestamp(todayEntry.date, todayEntry[name]),
  }));

  const past = entries.filter((e) => e.timestamp <= now);
  const upcoming = entries.filter((e) => e.timestamp > now);

  const current = past.length > 0 ? past[past.length - 1] : null;
  const next = upcoming.length > 0 ? upcoming[0] : null;

  return {
    date: todayEntry.date,
    day: todayEntry.day,
    hijri: todayEntry.hijri,
    entries,
    past,
    upcoming,
    current,
    next,
  };
}

export function getDateRange(): { min: string; max: string } | null {
  try {
    const data = loadAllPrayerData();
    if (data.length === 0) return null;
    return { min: data[0].date, max: data[data.length - 1].date };
  } catch {
    return null;
  }
}

export async function getPrayerTimes(): Promise<TodayPrayers> {
  const key = todayKey();
  return getPrayerTimesForDate(key);
}