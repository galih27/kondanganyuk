"use client";

import { useEffect, useState } from "react";
import type { ThemePalette } from "@/lib/themes";

export function Countdown({ targetDate, palette, dark }: { targetDate: string; palette: ThemePalette; dark: boolean }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(`${targetDate}T00:00:00`).getTime();
  if (isNaN(target)) return null;

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (diff === 0) {
    return (
      <p className="text-center text-sm font-bold uppercase tracking-widest" style={{ color: palette.accent }}>
        🎉 Hari yang ditunggu telah tiba!
      </p>
    );
  }

  const items: [string, number][] = [
    ["Hari", days],
    ["Jam", hours],
    ["Menit", minutes],
    ["Detik", seconds],
  ];

  return (
    <div>
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: palette.accent }}>
        Menuju Hari Bahagia
      </p>
      <div className="grid grid-cols-4 gap-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border py-4 text-center shadow-sm"
            style={{
              borderColor: `${palette.accent}33`,
              background: dark ? palette.surface : "#fff",
              color: palette.text,
            }}
          >
            <p className="text-2xl font-bold tabular-nums md:text-3xl">
              {String(value).padStart(2, "0")}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: palette.textMuted }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
