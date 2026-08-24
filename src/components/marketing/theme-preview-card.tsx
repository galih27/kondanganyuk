import { getTheme, type ThemeArt, type ThemePalette } from "@/lib/themes";
import { ClipArt } from "@/components/themes/ornaments-clipart";

/** Kartu pratinjau mini untuk katalog tema — memakai palet & gaya tiap tema,
 *  dengan dukungan override ornamen/palet (dipakai editor tema). */
export function ThemePreviewCard({
  id,
  href,
  selected,
  onSelect,
  overrideArt,
  overridePalette,
}: {
  id: string;
  href?: string;
  selected?: boolean;
  onSelect?: () => void;
  overrideArt?: ThemeArt | null;
  overridePalette?: Partial<ThemePalette>;
}) {
  const base = getTheme(id);
  const t = {
    ...base,
    art: overrideArt !== undefined ? (overrideArt ?? {}) : base.art,
    palette: { ...base.palette, ...overridePalette },
  };
  const headingFont =
    t.fontHeading === "script"
      ? "font-script text-3xl"
      : t.fontHeading === "classic"
        ? "font-classic text-2xl font-semibold"
        : t.fontHeading === "playful"
          ? "font-fun text-2xl font-semibold"
          : t.fontHeading === "serif-elegant"
            ? "font-serif-display text-2xl font-semibold"
            : "text-2xl font-semibold tracking-tight";

  const body = (
    <div
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        selected ? "border-brand-500 ring-4 ring-brand-100" : "border-stone-200"
      }`}
    >
      {/* Mock cover */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]})` }}>
        {t.art?.backdrop && (
          <ClipArt name={t.art.backdrop} className="absolute inset-1 opacity-30" style={{ color: t.palette.accent2 }} />
        )}
        {t.coverDecor?.map((d) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={d.src}
            src={d.src}
            alt=""
            aria-hidden
            className={`pointer-events-none select-none ${d.className.replace(/\bw-(40|56|60|80)\b/g, (m) => ({ "w-40": "w-14", "w-56": "w-14", "w-60": "w-24", "w-80": "w-24" }[m] ?? m))}`}
            style={d.src.includes("awan-bawah") && typeof t.art?.cloudsOpacity === "number" ? { opacity: Math.min(100, Math.max(0, t.art.cloudsOpacity)) / 100 } : undefined}
          />
        ))}
        {t.art?.frame && (
          <ClipArt
            name={t.art.frame}
            className="absolute top-1/2 left-1/2 h-32 max-w-[94%] -translate-x-1/2 -translate-y-1/2 opacity-35"
            style={{ color: t.palette.accent }}
          />
        )}
        {t.ornament === "confetti" && !t.art && (
          <div className="absolute inset-0 opacity-60">
            {[["8%", "18%"], ["82%", "12%"], ["16%", "72%"], ["88%", "68%"], ["50%", "8%"]].map(([l, tp], i) => (
              <span key={i} className="absolute h-2.5 w-2.5 rotate-45 rounded-sm" style={{ left: l, top: tp, background: i % 2 ? t.palette.accent2 : t.palette.accent }} />
            ))}
          </div>
        )}
        {t.ornament === "islamic" && !t.art && (
          <svg className="absolute inset-0 h-full w-full opacity-15" viewBox="0 0 200 160" preserveAspectRatio="none">
            <path d="M20 20h30v30H20zM150 20h30v30h-30zM20 110h30v30H20zM150 110h30v30h-30z" fill={t.palette.accent} />
            <circle cx="100" cy="80" r="34" fill="none" stroke={t.palette.accent} strokeWidth="3" />
            <circle cx="100" cy="80" r="22" fill="none" stroke={t.palette.accent2} strokeWidth="2" />
          </svg>
        )}
        {t.ornament === "floral" && !t.art && (
          <svg className="absolute inset-x-0 bottom-0 h-16 w-full opacity-40" viewBox="0 0 400 64" preserveAspectRatio="none">
            <path d="M0 64 C80 10 140 54 200 28 C260 2 330 52 400 14 L400 64 Z" fill={t.palette.accent} opacity="0.35" />
          </svg>
        )}
        {t.ornament === "geometric" && !t.art && !t.coverDecor && (
          <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 200 160" preserveAspectRatio="none">
            <path d="M0 130 L60 70 L120 130 M40 160 L100 100 L160 160" fill="none" stroke={t.palette.accent} strokeWidth="2.5" />
            <rect x="150" y="24" width="34" height="34" fill="none" stroke={t.palette.accent2} strokeWidth="2.5" transform="rotate(45 167 41)" />
          </svg>
        )}
        {t.coverStyle === "framed" && <div className="absolute inset-4 rounded-xl border" style={{ borderColor: `${t.palette.accent}55` }} />}
        {t.art?.corners && (
          <>
            <ClipArt name={t.art.corners} className="absolute top-0 left-0 h-14 w-14 opacity-80" style={{ color: t.palette.accent }} />
            <ClipArt name={t.art.corners} className="absolute right-0 bottom-0 h-14 w-14 rotate-180 opacity-80" style={{ color: t.palette.accent }} />
          </>
        )}
        <div className="relative z-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: t.palette.accent }}>The Wedding Of</p>
          <p className={`${headingFont} mt-1`} style={{ color: t.palette.text }}>Alya &amp; Rizky</p>
          <p className="mt-1 text-[10px] tracking-widest" style={{ color: t.palette.textMuted }}>12 . 08 . 2026</p>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-800">{t.name}</h3>
          {t.premium && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Premium</span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-stone-500">{t.description}</p>
        <div className="mt-3 flex gap-1.5">
          {[t.palette.bg, t.palette.surface, t.palette.accent, t.palette.accent2].map((c) => (
            <span key={c} className="h-4 w-4 rounded-full border border-stone-200" style={{ background: c }} />
          ))}
        </div>
      </div>

      {onSelect && (
        <div className={`pointer-events-none absolute inset-0 flex items-end justify-center rounded-2xl pb-4 transition ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <span className={`rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow ${selected ? "bg-brand-600" : "bg-stone-800/90"}`}>
            {selected ? "✓ Dipilih" : "Pilih Tema"}
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block h-full">
        {body}
      </a>
    );
  }
  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className="block h-full w-full cursor-pointer text-left">
        {body}
      </button>
    );
  }
  return body;
}
