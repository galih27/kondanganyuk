import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { normalizeInvitationData } from "@/lib/invitation-data";
import { getTheme } from "@/lib/themes";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Undangan digital Kondanganyuk";

const CATEGORY_LABEL: Record<string, string> = {
  WEDDING: "Pernikahan",
  KHITAN: "Khitanan",
  AQIQAH: "Aqiqah",
  BIRTHDAY: "Ulang Tahun",
  EVENT: "Syukuran",
};

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await db.invitation.findUnique({
    where: { slug },
    select: { category: true, themeId: true, data: true, title: true, ogImage: true },
  });

  // Gambar kustom unggahan pengguna menang atas kartu otomatis
  if (invitation?.ogImage) {
    const mediaId = invitation.ogImage.split("/").pop() ?? "";
    if (/^[a-z0-9]{20,32}$/i.test(mediaId)) {
      const media = await db.media.findUnique({
        where: { id: mediaId },
        select: { mimeType: true, data: true },
      });
      if (media) {
        return new Response(new Uint8Array(media.data), {
          headers: {
            "Content-Type": media.mimeType,
            "Cache-Control": "public, max-age=600",
          },
        });
      }
    }
  }

  const theme = getTheme(invitation?.themeId ?? "");
  const p = theme.palette;

  let title = invitation?.title ?? "Kondanganyuk";
  let dateLine = "";
  if (invitation) {
    try {
      const data = normalizeInvitationData(JSON.parse(invitation.data || "{}"));
      title =
        invitation.category === "WEDDING"
          ? [data.groomName, data.brideName].filter(Boolean).join(" & ") || invitation.title
          : data.personName || invitation.title;
      const ev = data.events.find((e) => e.date);
      if (ev?.date) {
        dateLine = new Date(ev.date).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    } catch {
      /* pakai judul internal */
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(160deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          color: p.text,
          padding: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: p.accent,
            borderBottom: `2px solid ${p.accent}`,
            paddingBottom: 14,
          }}
        >
          Undangan {CATEGORY_LABEL[invitation?.category ?? ""] ?? "Acara"}
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, marginTop: 30, textAlign: "center", maxWidth: 1000 }}>
          {title}
        </div>
        {dateLine && <div style={{ display: "flex", fontSize: 34, marginTop: 26, color: p.textMuted }}>{dateLine}</div>}
        <div style={{ display: "flex", position: "absolute", bottom: 40, fontSize: 26, letterSpacing: 4, color: p.accent }}>
          kondanganyuk.com
        </div>
      </div>
    ),
    size
  );
}
