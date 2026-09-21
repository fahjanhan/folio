export const dynamic = "force-dynamic";

import Header from "../components/Header";
import Footer from "../components/Footer";
import PrayerNav from "../components/PrayerNav";
import { getPrayerTimes, getDateRange } from "../../lib/prayer";

function toKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

async function getWeather(date: string) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=24.2075&longitude=55.7447&current=temperature_2m,relative_humidity_2m&daily=sunrise,sunset,moonrise,moonset,moon_phase&start_date=${date}&end_date=${date}&timezone=auto`,
      { next: { revalidate: 600 } }
    );
    const data = await res.json();
    const daily = data.daily;
    return {
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      astro: {
        sunrise: daily.sunrise?.[0] ?? null,
        sunset: daily.sunset?.[0] ?? null,
        moonrise: daily.moonrise?.[0] ?? null,
        moonset: daily.moonset?.[0] ?? null,
        moonPhase: daily.moon_phase?.[0] ?? null,
      },
    };
  } catch {
    return null;
  }
}

export default async function PrayerPage() {
  const prayers = await getPrayerTimes();
  const range = getDateRange();
  const weather = await getWeather(toKey(new Date()));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <PrayerNav
          initialData={{
            ...prayers,
            range,
            weather,
            todayNext: prayers.next,
            todayCurrent: prayers.current,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
