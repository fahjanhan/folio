"use client";

import { useState, useEffect } from "react";

export function PrayerCountdown({
  nextTimestamp,
}: {
  nextTimestamp: number | null;
}) {
  const [remaining, setRemaining] = useState<number>(() =>
    Math.max(0, (nextTimestamp ?? 0) - Date.now())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(0, (nextTimestamp ?? 0) - Date.now());
      setRemaining(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [nextTimestamp]);

  if (!nextTimestamp || remaining <= 0) {
    return <p className="text-lg font-semibold text-emerald-600">Now</p>;
  }

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <p className="text-2xl font-semibold tabular-nums tracking-wider">
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(seconds).padStart(2, "0")}
    </p>
  );
}
