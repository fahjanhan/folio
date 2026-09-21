import { NextRequest, NextResponse } from "next/server";
import { getPrayerTimesForDate, getPrayerTimes, getDateRange } from "../../../lib/prayer";

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Invalid date parameter. Use YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  try {
    const [data, today, weather] = await Promise.all([
      getPrayerTimesForDate(date),
      getPrayerTimes(),
      getWeather(date),
    ]);
    const range = getDateRange();
    return NextResponse.json({
      ...data,
      range,
      weather,
      todayNext: today.next,
      todayCurrent: today.current,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load prayer data for this date." },
      { status: 500 }
    );
  }
}
