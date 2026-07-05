export const dynamic = "force-dynamic";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { PrayerCountdown } from "../components/PrayerCountdown";
import { LiveTime } from "../components/LiveTime";
import { getPrayerTimes } from "../../lib/prayer";

async function getWeather() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=24.2075&longitude=55.7447&current=temperature_2m,relative_humidity_2m&timezone=auto",
      { next: { revalidate: 600 } }
    );
    const data = await res.json();
    return {
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
    };
  } catch {
    return null;
  }
}

export default async function PrayerPage() {
  const { date, day, hijri, entries, current, next } = await getPrayerTimes();
  const weather = await getWeather();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <section>
          <div className="mb-8">
            <h1 className="text-2xl font-medium tracking-tight">{day} <LiveTime /></h1>
            <p className="text-muted text-sm mt-1">
              {date} &middot; {hijri} AH
            </p>
                <p className="text-muted text-sm mt-1">
              Al Ain
              {weather && (
                <span> &middot; {weather.temp}&deg;C &middot; {weather.humidity}% humidity</span>
              )}
            </p>
          </div>

          {next && (
            <div className="border border-border p-6 mb-8">
              <p className="text-xs text-muted uppercase tracking-wide">Next Prayer</p>
              <div className="flex items-baseline justify-between mt-1">
                <h2 className="text-2xl font-semibold">{next.name}</h2>
                <p className="text-3xl font-semibold tabular-nums">{next.time}</p>
              </div>
              <div className="mt-2">
                <PrayerCountdown nextTimestamp={next.timestamp} />
              </div>
            </div>
          )}

          {!next && current && (
            <div className="border border-border p-6 mb-8 text-center">
              <p className="text-xs text-muted uppercase tracking-wide">Today&apos;s Prayers Complete</p>
              <p className="text-lg font-medium mt-1">
                Last: {current.name} &middot; {current.time}
              </p>
            </div>
          )}

          <div className="border border-border divide-y divide-border">
            {entries.map((p) => {
              const isCurrent = p.name === current?.name;
              return (
                <div
                  key={p.name}
                  className={`flex items-center justify-between px-5 py-4 ${
                    isCurrent ? "bg-foreground/[0.03]" : ""
                  }`}
                >
                  <span className={`text-base ${isCurrent ? "font-semibold" : "font-medium"}`}>
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
        </section>
      </main>
      <Footer />
    </div>
  );
}