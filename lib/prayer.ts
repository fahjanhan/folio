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

// Folder containing prayers-YYYY-MM.json files, e.g. app/data/prayers-2026-07.json
const DATA_DIR = path.join(process.cwd(), "app", "data");
const FILE_PATTERN = /^prayers-\d{4}-\d{2}\.json$/;

/**
 * Reads every prayers-YYYY-MM.json file in DATA_DIR and merges them into
 * one sorted array. Adding a new month's file requires no code changes.
 */
function loadAllPrayerData(): PrayerDay[] {
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

  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, hours, minutesRaw, 0, 0).getTime();
}

/**
 * Returns today's date as YYYY-MM-DD in local time.
 */
function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getPrayerTimes(): Promise<TodayPrayers> {
  const data = loadAllPrayerData();
  const key = todayKey();

  // Fall back to the closest available date if today isn't in the dataset
  // (keeps the page from breaking outside the available months).
  const todayEntry =
    data.find((d) => d.date === key) ??
    data.reduce((closest, d) =>
      Math.abs(new Date(d.date).getTime() - new Date(key).getTime()) <
      Math.abs(new Date(closest.date).getTime() - new Date(key).getTime())
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