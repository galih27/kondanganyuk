"use client";

import { useEffect, useState } from "react";

/** Deretan video momen dengan pemutar native. */
export function VideoSection({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="mt-10 space-y-4">
      {urls.map((url, i) => (
        <video
          key={`${url}-${i}`}
          src={url}
          controls
          preload="metadata"
          playsInline
          className="w-full rounded-2xl border border-black/5 bg-black shadow-md"
        />
      ))}
    </div>
  );
}

export function GallerySection({ urls }: { urls: string[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightbox === null) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? null : (i + 1) % urls.length));
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? null : (i - 1 + urls.length) % urls.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, urls.length]);

  return (
    <>
      <div className="mt-10 columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
        {urls.map((url, i) => (
          <button
            key={`${url}-${i}`}
            onClick={() => setLightbox(i)}
            className="group block w-full overflow-hidden rounded-2xl border border-black/5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Galeri ${i + 1}`}
              loading="lazy"
              className="w-full object-cover transition duration-500 group-hover:scale-105"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
              }}
            />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="lightbox-overlay fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur transition hover:bg-white/20" aria-label="Tutup">
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urls[lightbox]}
            alt={`Galeri ${lightbox + 1}`}
            className="anim-fade-in max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + urls.length) % urls.length); }}
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25"
            aria-label="Sebelumnya"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % urls.length); }}
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25"
            aria-label="Berikutnya"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
