import { NextRequest, NextResponse } from "next/server";
import { getPrayerTimesForDate, getPrayerTimes, getDateRange } from "../../../lib/prayer";

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
      getWeather(),
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
