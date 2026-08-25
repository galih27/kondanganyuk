"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "kondanganyuk.autoscroll";
const SPEED_PX_PER_SEC = 40;

/**
 * Tombol gulir otomatis untuk undangan.
 * - Mulai sendiri saat undangan dibuka (kecuali tamu pernah mematikan,
 *   atau pengguna sistem memilih reduced-motion).
 * - Berhenti otomatis di dasar halaman atau saat tamu menggulir manual
 *   (roda mouse, sentuhan, tombol papan ketik).
 */
export function AutoScrollToggle({ accent, dark }: { accent: string; dark?: boolean }) {
  const [on, setOn] = useState(false);

  // Preferensi tersimpan dipakai hanya saat pertama dibuka.
  useEffect(() => {
    let start = true;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "off") start = false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) start = false;
    } catch { /* abaikan */ }
    if (!start) return;
    const timer = setTimeout(() => setOn(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Loop animasi gulir berdasarkan waktu agar kecepatannya konsisten.
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      window.scrollBy(0, (SPEED_PX_PER_SEC * dt) / 1000);
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
        setOn(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };

    const stop = () => setOn(false);
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key)) stop();
    };

    raf = requestAnimationFrame(step);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchmove", stop, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", onKey);
    };
  }, [on]);

  function toggle() {
    setOn((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch { /* abaikan */ }
      return next;
    });
  }

  return (
    <button
      onClick={toggle}
      aria-label={on ? "Hentikan gulir otomatis" : "Aktifkan gulir otomatis"}
      title={on ? "Hentikan gulir otomatis" : "Gulir otomatis"}
      className="anim-float fixed bottom-20 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full text-sm shadow-xl transition hover:scale-110"
      style={{ background: accent, color: dark ? "#141210" : "#fff" }}
    >
      {on ? "❚❚" : "▶"}
    </button>
  );
}
