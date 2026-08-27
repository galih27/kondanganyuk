"use client";
import Link from "next/link";

import { useEffect, useRef, useState } from "react";
import type { InvitationData } from "@/lib/invitation-data";
import { getTheme, SECTION_KEYS, type SectionKey, type SectionStyle, type ThemeArt, type ThemePalette } from "@/lib/themes";
import { formatDateID, normalizeMapsEmbed } from "@/lib/utils";
import { Countdown } from "./countdown";
import { RsvpSection } from "./rsvp-section";
import { GallerySection, VideoSection } from "./gallery-section";
import { OrnamentTop, OrnamentBottom, CoverFrame, ConfettiField, IslamicBand, GeometricCorner } from "./ornaments";
import { ClipArt } from "./ornaments-clipart";
import { AutoScrollToggle } from "./auto-scroll-toggle";
import { BankAtmCard } from "./bank-card";

export interface WishPublic {
  id: string;
  guestName: string;
  attendance: string;
  message: string;
  reply: string | null;
}

interface Props {
  slug: string;
  category: string;
  plan: string;
  themeId: string;
  data: InvitationData;
  guestName: string;
  initialWishes: WishPublic[];
  unlocked: { music: boolean; gift: boolean; watermark: boolean };
  artOverride?: ThemeArt | null;
  paletteOverride?: Partial<ThemePalette> | null;
}

const headingFontClass = (f: string) =>
  f === "script" ? "font-script" : f === "classic" ? "font-classic font-semibold" : f === "playful" ? "font-fun font-semibold" : f === "serif-elegant" ? "font-serif-display font-semibold" : f === "scriptina" ? "font-scriptina" : f === "magnolia" ? "font-magnolia" : "font-semibold tracking-tight";

function googleCalendarUrl(ev: { name: string; date: string; startTime: string; place: string; address: string }) {
  if (!ev.date) return null;
  const start = `${ev.date.replaceAll("-", "")}T${ev.startTime.replace(":", "")}00`;
  const endHour = String(Math.min(23, Number(ev.startTime.split(":")[0]) + 2)).padStart(2, "0");
  const end = `${ev.date.replaceAll("-", "")}T${endHour}${ev.startTime.split(":")[1] ?? "00"}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.name,
    dates: `${start}/${end}`,
    location: [ev.place, ev.address].filter(Boolean).join(", "),
    details: "Dari undangan digital Kondanganyuk",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsDownload(events: InvitationData["events"], title: string) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kondanganyuk//ID"];
  for (const ev of events) {
    if (!ev.date) continue;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${Math.random().toString(36).slice(2)}@kondanganyuk`,
      `DTSTART:${ev.date.replaceAll("-", "")}T${(ev.startTime || "09:00").replace(":", "")}00`,
      `DTEND:${ev.date.replaceAll("-", "")}T${(ev.endTime || "11:00").replace(":", "")}00`,
      `SUMMARY:${title} - ${ev.name}`,
      `LOCATION:${[ev.place, ev.address].filter(Boolean).join(", ")}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
}

export function InvitationView({ slug, category, themeId, data, guestName, initialWishes, unlocked, artOverride, paletteOverride }: Props) {
  const base = getTheme(themeId);
  const t: ReturnType<typeof getTheme> = {
    ...base,
    ...(artOverride !== undefined && artOverride !== null ? { art: artOverride } : {}),
    palette: { ...base.palette, ...paletteOverride },
  };
  const p = t.palette;
  const cloudsOp = typeof t.art?.cloudsOpacity === "number" ? Math.min(100, Math.max(0, t.art.cloudsOpacity)) / 100 : null;
  const cloudsStyle = cloudsOp !== null ? { opacity: cloudsOp } : undefined;
  const hFont = headingFontClass(t.fontHeading);
  const bodyFont = t.fontBody === "serif" ? "font-classic" : "";

  // ===== Pengaturan per-seksi (font judul, skala ukuran, warna teks) =====
  const secCfg = (k: SectionKey): SectionStyle => t.art?.sectionStyles?.[k] ?? {};
  const dim = (c: string) => (/^#[0-9a-fA-F]{6}$/.test(c) ? `${c}cc` : c);
  const spal = (k: SectionKey): ThemePalette => {
    const c = secCfg(k).textColor;
    return c ? { ...p, text: c, textMuted: dim(c) } : p;
  };
  const hf = (k: SectionKey) => {
    const f = secCfg(k).headingFont;
    return f ? headingFontClass(f) : hFont;
  };
  const zs = (k: SectionKey): React.CSSProperties | undefined => {
    const s = secCfg(k).scale;
    return s && s !== 1 ? { zoom: s } : undefined;
  };
  const stheme = (k: SectionKey): typeof t => ({ ...t, palette: spal(k) });

  const [opened, setOpened] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Musik diputar saat undangan dibuka (gesture pengguna)
  function handleOpen() {
    setOpened(true);
    document.body.style.overflow = "";
    if (unlocked.music && data.musicUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    window.scrollTo({ top: 0 });
  }

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  const isWedding = category === "WEDDING";
  const mainPerson = isWedding ? "" : data.personName;

  const coupleTitle = isWedding
    ? { a: data.groomName || "Mempelai", b: data.brideName || "Mempelai" }
    : null;

  function coverName(a: string, initial: string) {
    if (data.coverNameType !== "initial") return a;
    return initial || a;
  }
  const coverA = coupleTitle ? coverName(coupleTitle.a, data.groomInitial.trim()) : "";
  const coverB = coupleTitle ? coverName(coupleTitle.b, data.brideInitial.trim()) : "";

  const firstEventDate = data.events.find((e) => e.date)?.date ?? "";

  const decorImg = (match: string, cls?: string, style?: React.CSSProperties) => {
    const d = t.coverDecor?.find((x) => x.src.includes(match));
    if (!d) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={d.src} alt="" aria-hidden className={`pointer-events-none select-none ${cls ?? d.className}`} style={style} />
    );
  };

  return (
    <div className="invitation-scroll min-h-screen" style={{ background: p.bg, color: p.text }}>
      {/* Musik */}
      {data.musicUrl && unlocked.music && (
        <audio ref={audioRef} src={data.musicUrl} loop preload="none" />
      )}
      {/* Tombol musik manual */}
      {data.musicUrl && unlocked.music && opened && (
        <MusicToggle audioRef={audioRef} accent={p.accent} />
      )}
      {/* Gulir otomatis */}
      {opened && <AutoScrollToggle accent={p.accent} dark={t.dark} />}

      {/* ===== COVER ===== */}
      {!opened && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 text-center" style={{ background: `linear-gradient(160deg, ${t.gradient[0]}, ${t.gradient[1]})` }}>
          {t.ornament === "floral" && <OrnamentTop accent={p.accent} />}
          {t.ornament === "confetti" && <ConfettiField colors={[p.accent, p.accent2, "#ffd166", "#06d6a0"]} />}
          {t.ornament === "islamic" && <IslamicBand accent={p.accent} position="top" />}
          {t.ornament === "geometric" && !t.coverDecor && <GeometricCorner accent={p.accent} accent2={p.accent2} />}
          {t.coverStyle === "framed" && <CoverFrame accent={p.accent} />}
          {t.coverDecor?.map((d) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={d.src}
              src={d.src}
              alt=""
              aria-hidden
              className={`pointer-events-none select-none ${d.className}`}
              style={d.src.includes("awan-bawah") ? cloudsStyle : undefined}
            />
          ))}
          {t.art?.corners && (
            <>
              <ClipArt name={t.art.corners} className="absolute top-0 left-0 z-0 h-36 w-36 opacity-70 sm:h-52 sm:w-52" style={{ color: p.accent }} />
              <ClipArt name={t.art.corners} className="absolute right-0 bottom-0 z-0 h-36 w-36 rotate-180 opacity-70 sm:h-52 sm:w-52" style={{ color: p.accent }} />
            </>
          )}
          {t.art?.backdrop && (
            <ClipArt name={t.art.backdrop} className="absolute inset-3 z-0 opacity-30 sm:inset-5" style={{ color: p.accent2 }} />
          )}
          {t.art?.frame && (
            <ClipArt
              name={t.art.frame}
              className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[400px] max-w-[94%] -translate-x-1/2 -translate-y-1/2 opacity-35"
              style={{ color: p.accent }}
            />
          )}

          <div className="relative z-10 anim-fade-up">
            <p className={`text-xs uppercase tracking-[0.4em] ${t.dark ? "" : "opacity-80"}`} style={{ color: p.accent }}>
              Undangan {isWedding ? "Pernikahan" : { KHITAN: "Khitanan", AQIQAH: "Aqiqah", BIRTHDAY: "Ulang Tahun", EVENT: "Syukuran" }[category] ?? ""}
            </p>

            

            {coupleTitle ? (
              data.coverNameType === "initial" ? (
                <div className="mx-auto mt-4 flex max-w-fit flex-col items-start leading-none">
                  <span className={`${hf("pembuka")} text-8xl md:text-9xl`} style={{ color: p.text }}>
                    {data.coupleOrder === "wanita-pria" ? coverB : coverA}
                  </span>
                  <span className={`${hf("pembuka")} ml-10 -mt-3 text-3xl md:ml-16`} style={{ color: p.accent }}>&amp;</span>
                  <span className={`${hf("pembuka")} ml-20 -mt-3 text-8xl md:ml-32 md:text-9xl`} style={{ color: p.text }}>
                    {data.coupleOrder === "wanita-pria" ? coverA : coverB}
                  </span>
                </div>
              ) : (
                <>
                  <h1 className={`${hf("pembuka")} mt-4 text-6xl leading-tight md:text-7xl`} style={{ color: p.text }}>
                    {data.coupleOrder === "wanita-pria" ? coverB : coverA}
                  </h1>
                  <p className={`${hf("pembuka")} my-2 text-3xl`} style={{ color: p.accent }}>&amp;</p>
                  <h1 className={`${hf("pembuka")} text-6xl leading-tight md:text-7xl`} style={{ color: p.text }}>
                    {data.coupleOrder === "wanita-pria" ? coverA : coverB}
                  </h1>
                </>
              )
            ) : (
              <h1 className={`${hFont} mt-5 text-5xl leading-tight md:text-6xl`} style={{ color: p.text }}>
                {mainPerson || data.events[0]?.name || "Undangan"}
              </h1>
            )}

            {guestName && (
              <p className={`mt-6 text-sm ${bodyFont}`} style={{ color: p.textMuted }}>
                Kepada Bapak/Ibu/Saudara/i
              </p>
            )}

            {guestName && (
              <p className={`${hFont} mt-5 text-3xl`} style={{ color: p.accent }}>{guestName}</p>
            )}

            {firstEventDate && (
              <p className="mt-5 text-sm tracking-[0.25em]" style={{ color: p.textMuted }}>
                {formatDateID(firstEventDate)}
              </p>
            )}

            <button
              onClick={handleOpen}
              className="anim-ring mt-9 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold shadow-xl transition hover:scale-[1.03] active:scale-95"
              style={{ background: p.accent, color: t.dark ? "#141210" : "#fff" }}
            >
              ✉️ Buka Undangan
            </button>
          </div>
          {t.ornament === "floral" && <OrnamentBottom accent={p.accent} />}
          {unlocked.watermark && (
            <Link href="/" target="_blank" rel="noreferrer" className="absolute bottom-4 z-10 text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100" style={{ color: p.textMuted }}>
              Dibuat dengan Kondanganyuk
            </Link>
          )}
        </div>
      )}

      {/* ===== KONTEN ===== */}
      {opened && (
        <div>
          {/* Pembuka */}
          <section data-sec="pembuka" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center" style={{ ...zs("pembuka"), background: `linear-gradient(160deg, ${t.gradient[0]}, ${t.gradient[1]})` }}>
            {t.ornament === "floral" && <OrnamentTop accent={p.accent} />}
            {t.ornament === "confetti" && <ConfettiField colors={[p.accent, p.accent2, "#ffd166", "#06d6a0"]} />}
            {t.ornament === "islamic" && <IslamicBand accent={p.accent} position="top" />}
            {decorImg("awan-kiri")}
            {decorImg("awan-kanan")}
            {decorImg("gunungan", "relative z-10 mb-8 w-36 opacity-80 sm:w-44")}
            <div className="relative z-10 max-w-lg">
              {data.quoteText ? (
                <blockquote>
                  <p className={`${bodyFont} italic leading-relaxed`} style={{ color: spal("pembuka").text }}>
                    &ldquo;{data.quoteText}&rdquo;
                  </p>
                  {data.quoteSource && (
                    <cite className="mt-3 block text-xs not-italic tracking-wide" style={{ color: p.accent }}>
                      — {data.quoteSource}
                    </cite>
                  )}
                </blockquote>
              ) : (
                <p className={`${bodyFont} leading-relaxed`} style={{ color: spal("pembuka").textMuted }}>
                  Dengan memohon rahmat dan ridha Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan acara ini dan mengundang Anda untuk hadir memberikan doa restu.
                </p>
              )}

              {coupleTitle ? null : (
                <>
                  <h2 className={`${hf("pembuka")} mt-12 text-5xl`} style={{ color: spal("pembuka").text }}>{mainPerson}</h2>
                  {data.personDetail && (
                    <p className={`${bodyFont} mt-3 text-sm leading-relaxed`} style={{ color: spal("pembuka").textMuted }}>{data.personDetail}</p>
                  )}
                </>
              )}
            </div>
            {t.ornament === "floral" && <OrnamentBottom accent={p.accent} />}
            {t.ornament === "islamic" && <IslamicBand accent={p.accent} position="bottom" />}
          </section>

          {/* ===== SAVE THE DATE ===== */}
          {firstEventDate && (
            <section data-sec="acara" className="px-6 py-20 text-center" style={{ ...zs("acara"), background: p.surface }}>
              <div className="mx-auto max-w-lg">
                <SectionHeading title="Save The Date" theme={stheme("acara")} hFont={hf("acara")} />
                <p className={`${bodyFont} mt-8 text-sm uppercase tracking-[0.35em]`} style={{ color: spal("acara").textMuted }}>
                  {new Date(`${firstEventDate}T00:00:00`).toLocaleDateString("id-ID", { weekday: "long" })}
                </p>
                <p className={`${hf("acara")} mt-1 text-7xl leading-none`} style={{ color: spal("acara").text }}>
                  {new Date(`${firstEventDate}T00:00:00`).getDate()}
                </p>
                <p className={`${hf("acara")} mt-2 text-2xl`} style={{ color: p.accent }}>
                  {new Date(`${firstEventDate}T00:00:00`).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </p>
                <Countdown targetDate={firstEventDate} palette={stheme("acara").palette} dark={t.dark} />
              </div>
            </section>
          )}

          {/* ===== MEMPELAI ===== */}
          {coupleTitle && (
            <section data-sec="mempelai" className="relative overflow-hidden px-6 py-20" style={zs("mempelai")}>
              {decorImg("gunungan", "pointer-events-none absolute top-1/2 left-1/2 z-0 w-72 -translate-x-1/2 -translate-y-1/2 opacity-10 sm:w-96")}
              {t.art?.frame && (
                <ClipArt
                  name={t.art.frame}
                  className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[560px] max-w-[94%] -translate-x-1/2 -translate-y-1/2 opacity-30"
                  style={{ color: p.accent }}
                />
              )}
              <div className="relative z-10 mx-auto max-w-2xl">
                <SectionHeading title="Mempelai" theme={stheme("mempelai")} hFont={hf("mempelai")} />
                <div className="mt-10 grid items-start gap-10 sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
                  {data.coupleOrder === "wanita-pria" ? (
                    <>
                      <CoupleCard palette={spal("mempelai")} hFont={hf("mempelai")} bodyFont={bodyFont} photo={data.bridePhoto} nick={coupleTitle.b} full={data.brideFull} relation="Putri dari" parents={data.brideParents} altSide={false} />
                      <p className={`${hf("mempelai")} self-center text-center text-4xl`} style={{ color: p.accent }}>&amp;</p>
                      <CoupleCard palette={spal("mempelai")} hFont={hf("mempelai")} bodyFont={bodyFont} photo={data.groomPhoto} nick={coupleTitle.a} full={data.groomFull} relation="Putra dari" parents={data.groomParents} altSide />
                    </>
                  ) : (
                    <>
                      <CoupleCard palette={spal("mempelai")} hFont={hf("mempelai")} bodyFont={bodyFont} photo={data.groomPhoto} nick={coupleTitle.a} full={data.groomFull} relation="Putra dari" parents={data.groomParents} altSide={false} />
                      <p className={`${hf("mempelai")} self-center text-center text-4xl`} style={{ color: p.accent }}>&amp;</p>
                      <CoupleCard palette={spal("mempelai")} hFont={hf("mempelai")} bodyFont={bodyFont} photo={data.bridePhoto} nick={coupleTitle.b} full={data.brideFull} relation="Putri dari" parents={data.brideParents} altSide />
                    </>
                  )}
                </div>
                <p className={`${bodyFont} mt-10 text-center text-sm italic leading-relaxed`} style={{ color: spal("mempelai").textMuted }}>
                  Merupakan kehormatan bagi kami apabila Anda berkenan hadir memberikan doa restu.
                </p>
              </div>
            </section>
          )}

          {/* Acara */}
          <section data-sec="acara" className="px-6 py-20" style={zs("acara")}>
            <div className="mx-auto max-w-3xl space-y-8">
              <SectionHeading title={isWedding ? "Rangkaian Acara" : "Waktu & Tempat"} theme={stheme("acara")} hFont={hf("acara")} />
              {data.dressCode && (
                <p className="text-center">
                  <span className="inline-block rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ background: `${p.accent}18`, color: p.accent }}>
                    Dresscode · {data.dressCode}
                  </span>
                </p>
              )}

              {data.events.map((ev, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border" style={{ borderColor: `${p.accent}44`, background: p.surface }}>
                  <div className="px-7 pt-7 pb-4 text-center">
                    <h3 className={`${hf("acara")} text-2xl`} style={{ color: p.accent }}>{ev.name}</h3>
                    {ev.date && (
                      <p className={`${bodyFont} mt-3 text-sm`} style={{ color: spal("acara").textMuted }}>
                        {formatDateID(ev.date)}
                        {ev.startTime && <> · Pukul {ev.startTime}{ev.endTime ? `–${ev.endTime}` : " WIB"}</>}
                      </p>
                    )}
                  </div>
                  <div className="px-7 pb-7">
                    {ev.place && <p className="text-center font-semibold" style={{ color: spal("acara").text }}>{ev.place}</p>}
                    {ev.address && <p className={`${bodyFont} mt-1 text-center text-sm leading-relaxed`} style={{ color: spal("acara").textMuted }}>{ev.address}</p>}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      {(ev.mapsUrl || ev.address) && (
                        <a
                          href={ev.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([ev.place, ev.address].filter(Boolean).join(" "))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full px-5 py-2.5 text-xs font-bold transition hover:opacity-85"
                          style={{ background: p.accent, color: t.dark ? "#141210" : "#fff" }}
                        >
                          📍 Lihat Lokasi
                        </a>
                      )}
                      {googleCalendarUrl(ev) && (
                        <a
                          href={googleCalendarUrl(ev)!}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border px-5 py-2.5 text-xs font-bold transition hover:opacity-70"
                          style={{ borderColor: p.accent, color: p.accent }}
                        >
                          🗓️ Simpan ke Kalender
                        </a>
                      )}
                      {ev.date && (
                        <a
                          href={icsDownload([ev], coupleTitle ? `${coupleTitle.a} & ${coupleTitle.b}` : mainPerson || ev.name)}
                          download={`${slug}-${ev.name.toLowerCase().replace(/\s+/g, "-")}.ics`}
                          className="rounded-full border px-5 py-2.5 text-xs font-bold transition hover:opacity-70"
                          style={{ borderColor: p.accent, color: p.accent }}
                        >
                          ⬇️ Unduh (.ics)
                        </a>
                      )}
                    </div>
                    {(ev.address || ev.place) && (
                      <iframe
                        title={`Peta ${ev.name}`}
                        src={
                          normalizeMapsEmbed(ev.mapsEmbed) ||
                          `https://www.google.com/maps?q=${encodeURIComponent([ev.place, ev.address].filter(Boolean).join(" "))}&output=embed`
                        }
                        className="mt-5 h-52 w-full rounded-2xl border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    )}
                  </div>
                </div>
              ))}

              {data.streamingUrl && (
                <div className="rounded-2xl border p-5 text-center" style={{ borderColor: `${p.accent}44`, background: p.surface }}>
                  <p className={`${bodyFont} text-sm`} style={{ color: spal("acara").textMuted }}>Tidak bisa hadir? Ikuti secara daring:</p>
                  <a href={data.streamingUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full border px-5 py-2.5 text-xs font-bold transition hover:opacity-70" style={{ borderColor: p.accent, color: p.accent }}>
                    ▶ Tonton Live Streaming
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Cerita */}
          {data.story.length > 0 && (
            <section data-sec="cerita" className="px-6 py-20" style={{ ...zs("cerita"), background: p.surface }}>
              <div className="mx-auto max-w-2xl">
                <SectionHeading title="Cerita Kami" theme={stheme("cerita")} hFont={hf("cerita")} />
                <ol className="relative mt-10 space-y-10 before:absolute before:left-[7px] before:h-full before:w-px" style={{ color: spal("cerita").text }}>
                  {data.story.map((s, i) => (
                    <li key={i} className="relative pl-8 before:absolute before:left-0 before:top-1.5 before:h-4 before:w-4 before:rounded-full before:border-4" style={{ ["--before-color" as string]: p.accent }}>
                      <span className="absolute left-0 top-1.5 block h-4 w-4 rounded-full border-4" style={{ borderColor: p.accent, background: p.surface }} />
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: p.accent }}>
                        {s.date ? formatDateID(s.date) : ""}
                      </p>
                      <h4 className={`${hf("cerita")} mt-1 text-xl`}>{s.title}</h4>
                      <p className={`${bodyFont} mt-2 text-sm leading-relaxed`} style={{ color: spal("cerita").textMuted }}>{s.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* Galeri */}
          {(data.galleryUrls.length > 0 || data.galleryVideos.length > 0) && (
            <section data-sec="galeri" className="px-6 py-20" style={zs("galeri")}>
              <div className="mx-auto max-w-3xl">
                <SectionHeading title="Galeri Momen" theme={stheme("galeri")} hFont={hf("galeri")} />
                <GallerySection urls={data.galleryUrls} />
                <VideoSection urls={data.galleryVideos} />
              </div>
            </section>
          )}

          {/* Amplop digital */}
          {unlocked.gift && (data.banks.some((b) => b.bank || b.number) || data.giftAddress) && (
            <section data-sec="kado" className="px-6 py-20" style={{ ...zs("kado"), background: p.surface }}>
              <div className="mx-auto max-w-xl">
                <SectionHeading title="Amplop Digital" theme={stheme("kado")} hFont={hf("kado")} />
                <p className={`${bodyFont} mt-4 text-center text-sm leading-relaxed`} style={{ color: spal("kado").textMuted }}>
                  Doa restu Anda adalah hadiah terindah. Namun jika ingin memberi tanda kasih, silakan gunakan kanal berikut.
                </p>
                <div className="mt-8 space-y-6">
                  {data.banks.filter((b) => b.bank || b.number).map((b, i) => (
                    <BankAtmCard key={i} bank={b.bank} number={b.number} holder={b.holder} />
                  ))}
                  {data.giftAddress && (
                    <GiftCard label="Kirim Hadiah Fisik" value={data.giftAddress} accent={spal("kado").accent} surface={p.bg} textColor={spal("kado").text} multiline />
                  )}
                </div>
              </div>
            </section>
          )}

          {/* RSVP & ucapan */}
          <RsvpSection slug={slug} theme={stheme("rsvp")} hFont={hf("rsvp")} bodyFont={bodyFont} guestName={guestName} initialWishes={initialWishes} />

          {/* Penutup */}
          <section data-sec="penutup" className="relative overflow-hidden px-6 py-20 text-center" style={{ ...zs("penutup"), background: `linear-gradient(160deg, ${t.gradient[0]}, ${t.gradient[1]})` }}>
            {decorImg("awan-bawah", undefined, cloudsStyle)}
            {decorImg("awan-kiri", "pointer-events-none absolute bottom-0 right-0 z-0 w-32 rotate-180 opacity-90 sm:w-44")}
            {decorImg("awan-kanan", "pointer-events-none absolute left-0 bottom-0 z-0 w-32 rotate-180 opacity-90 sm:w-44")}
            <div className="mx-auto max-w-md">
              <p className={`${bodyFont} leading-relaxed`} style={{ color: spal("penutup").textMuted }}>
                {data.closingNote ||
                  "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir untuk memberikan doa restu."}
              </p>
              {coupleTitle && (
                <p className={`${hf("penutup")} mt-8 text-4xl`} style={{ color: spal("penutup").text }}>
                  {coupleTitle.a} &amp; {coupleTitle.b}
                </p>
              )}
              {!coupleTitle && mainPerson && (
                <p className={`${hf("penutup")} mt-8 text-4xl`} style={{ color: spal("penutup").text }}>{mainPerson} &amp; Keluarga</p>
              )}
              {data.quoteText && !data.closingNote && (
                <p className={`${bodyFont} mt-6 text-sm italic`} style={{ color: spal("penutup").textMuted }}>
                  &ldquo;{data.quoteText}&rdquo; — {data.quoteSource}
                </p>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t px-6 py-8 text-center" style={{ borderColor: `${p.accent}33`, background: p.bg }}>
            {unlocked.watermark ? (
              <Link href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-xs font-semibold text-stone-700 shadow-lg ring-1 ring-stone-200 transition hover:bg-white">
                ♥ Dibuat dengan <strong>Kondanganyuk</strong> — buat undanganmu gratis
              </Link>
            ) : (
              <p className="text-xs" style={{ color: p.textMuted }}>© {new Date().getFullYear()} · Dibuat dengan Kondanganyuk</p>
            )}
          </footer>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ title, theme, hFont }: { title: string; theme: ReturnType<typeof getTheme>; hFont: string }) {
  return (
    <div className="text-center">
      <span className="mx-auto mb-3 block h-px w-14" style={{ background: theme.palette.accent }} />
      <h2 className={`${hFont} text-3xl`} style={{ color: theme.palette.text }}>{title}</h2>
      <ClipArt name="flourish-divider" className="mx-auto mt-2 block h-5 w-40" style={{ color: theme.palette.accent }} />
    </div>
  );
}

function CoupleCard({ palette, hFont, bodyFont, photo, nick, full, relation, parents, altSide }: {
  palette: ReturnType<typeof getTheme>["palette"];
  hFont: string;
  bodyFont: string;
  photo: string;
  nick: string;
  full: string;
  relation: string;
  parents: string;
  altSide?: boolean;
}) {
  const p = palette;
  return (
    <div className={`text-center ${altSide ? "sm:mt-10" : ""}`}>
      <div
        className="mx-auto aspect-[3/4] w-full max-w-[230px] overflow-hidden rounded-[28px] border-4 shadow-lg transition-transform duration-300 hover:-translate-y-1"
        style={{ borderColor: `${p.accent}55`, background: p.surface }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`Foto ${nick}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ color: `${p.accent}55` }}>
            <span className="text-6xl">♥</span>
          </div>
        )}
      </div>
      <h3 className={`${hFont} mt-4 text-3xl`} style={{ color: p.text }}>{nick}</h3>
      {full && <p className={`${bodyFont} mt-1 text-sm font-semibold leading-snug`} style={{ color: p.accent }}>{full}</p>}
      {parents && <p className={`${bodyFont} mt-1 text-xs`} style={{ color: p.textMuted }}>{relation} {parents}</p>}
    </div>
  );
}

function GiftCard({ label, value, sub, accent, surface, textColor, multiline }: { label: string; value: string; sub?: string; accent: string; surface: string; textColor: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* abaikan */ }
  }
  return (
    <div className="flex items-start gap-4 rounded-2xl p-5 shadow-sm" style={{ background: surface }}>
      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg" style={{ background: `${accent}22`, color: accent }}>🎁</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>{label}</p>
        <p className={`mt-1 break-words ${multiline ? "text-sm leading-relaxed" : "text-lg font-bold tracking-wide"}`} style={{ color: textColor }}>
          {value}
        </p>
        {sub && <p className="mt-0.5 text-sm" style={{ color: `${textColor}99` }}>a.n. {sub}</p>}
      </div>
      <button onClick={copy} className="shrink-0 rounded-full px-4 py-2 text-xs font-bold transition hover:opacity-80" style={{ background: accent, color: "#fff" }}>
        {copied ? "✓ Tersalin" : "Salin"}
      </button>
    </div>
  );
}

function MusicToggle({ audioRef, accent }: { audioRef: React.RefObject<HTMLAudioElement | null>; accent: string }) {
  const [playing, setPlaying] = useState(true);
  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().catch(() => {});
      setPlaying(true);
    }
  }
  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Hentikan musik" : "Putar musik"}
      className="anim-float fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full text-lg shadow-xl transition hover:scale-110"
      style={{ background: accent, color: "#fff" }}
    >
      {playing ? "♪" : "♪̸"}
    </button>
  );
}
