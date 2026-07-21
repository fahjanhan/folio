export const dynamic = "force-dynamic";

import Header from "../components/Header";
import Footer from "../components/Footer";
import PrayerNav from "../components/PrayerNav";
import { getPrayerTimes, getDateRange } from "../../lib/prayer";

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
  const prayers = await getPrayerTimes();
  const range = getDateRange();
  const weather = await getWeather();

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
