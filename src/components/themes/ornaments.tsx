// Ornamen dekoratif original — SVG sederhana yang di-tint dengan warna aksen tema.

export function OrnamentTop({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 90" className="pointer-events-none absolute left-0 top-0 w-full opacity-30" preserveAspectRatio="none" aria-hidden>
      <path d="M0 0 C120 70 280 70 400 0 Z" fill={accent} opacity="0.25" />
      <circle cx="200" cy="18" r="5" fill={accent} />
      <circle cx="170" cy="26" r="3" fill={accent} opacity="0.7" />
      <circle cx="230" cy="26" r="3" fill={accent} opacity="0.7" />
    </svg>
  );
}

export function OrnamentBottom({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 90" className="pointer-events-none absolute bottom-0 left-0 w-full rotate-180 opacity-30" preserveAspectRatio="none" aria-hidden>
      <path d="M0 0 C120 70 280 70 400 0 Z" fill={accent} opacity="0.25" />
    </svg>
  );
}

/** Bingkai ganda untuk cover bergaya "framed". */
export function CoverFrame({ accent }: { accent: string }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-3 rounded-2xl border sm:inset-5" style={{ borderColor: `${accent}66` }} />
      <div className="pointer-events-none absolute inset-4 rounded-xl border sm:inset-7" style={{ borderColor: `${accent}44` }} />
      {[["top-2 left-2"], ["top-2 right-2"], ["bottom-2 left-2"], ["bottom-2 right-2"]].map(([pos], i) => (
        <span key={i} className={`absolute ${pos} h-3 w-3 rotate-45`} style={{ background: accent }} />
      ))}
    </>
  );
}

/** Pita pola geometris islami (kubah & bintang) untuk tepi atas/bawah. */
export function IslamicBand({ accent, position }: { accent: string; position: "top" | "bottom" }) {
  return (
    <svg
      viewBox="0 0 400 60"
      className={`pointer-events-none absolute left-0 w-full opacity-35 ${position === "top" ? "top-0" : "bottom-0 rotate-180"}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i} transform={`translate(${i * 50 + 25}, 30)`}>
          <path d="M0 -18 C10 -8 16 0 16 8 A16 16 0 1 1 -16 8 C-16 0 -10 -8 0 -18 Z" fill="none" stroke={accent} strokeWidth="2.5" />
          <circle cx="0" cy="-24" r="3" fill={accent} />
        </g>
      ))}
    </svg>
  );
}

/** Garis sudut modern untuk tema geometric/minimal gelap. */
export function GeometricCorner({ accent, accent2 }: { accent: string; accent2: string }) {
  return (
    <>
      <svg viewBox="0 0 120 120" className="pointer-events-none absolute left-4 top-4 h-20 w-20 opacity-70" aria-hidden>
        <path d="M10 110 V40 Q10 10 40 10 H110" fill="none" stroke={accent} strokeWidth="2.5" />
        <circle cx="10" cy="10" r="4" fill={accent2} />
      </svg>
      <svg viewBox="0 0 120 120" className="pointer-events-none absolute bottom-4 right-4 h-20 w-20 opacity-70" aria-hidden>
        <path d="M110 10 V80 Q110 110 80 110 H10" fill="none" stroke={accent} strokeWidth="2.5" />
        <circle cx="110" cy="110" r="4" fill={accent2} />
      </svg>
    </>
  );
}

/** Konfeti untuk tema playful (ceria). */
export function ConfettiField({ colors }: { colors: string[] }) {
  const bits = Array.from({ length: 24 }, (_, i) => ({
    left: `${(i * 41 + 13) % 100}%`,
    top: `${(i * 29 + 7) % 90}%`,
    color: colors[i % colors.length],
    size: 6 + ((i * 7) % 8),
    delay: `${(i % 10) * 0.35}s`,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="anim-float absolute"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            borderRadius: i % 3 === 0 ? "9999px" : "3px",
            transform: `rotate(${(i * 37) % 360}deg)`,
            background: b.color,
            opacity: 0.55,
            animationDelay: b.delay,
          }}
        />
      ))}
    </div>
  );
}
