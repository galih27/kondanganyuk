export type PlanId = "FREE" | "BASIC" | "PREMIUM";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  durationDays: number | null; // null = selamanya
  tagline: string;
  features: { label: string; included: boolean }[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  FREE: {
    id: "FREE",
    name: "Gratis",
    price: 0,
    durationDays: 14,
    tagline: "Uji coba sebelum membeli",
    features: [
      { label: "Semua tema standar", included: true },
      { label: "Aktif 14 hari", included: true },
      { label: "RSVP & ucapan", included: true },
      { label: "Countdown & lokasi acara", included: true },
      { label: "Galeri maks. 4 foto", included: true },
      { label: "Musik latar", included: false },
      { label: "Amplop digital / titip kado", included: false },
      { label: "Tanpa watermark", included: false },
      { label: "QR check-in tamu", included: false },
      { label: "Aktif selamanya", included: false },
    ],
  },
  BASIC: {
    id: "BASIC",
    name: "Basic",
    price: 49000,
    durationDays: 30,
    tagline: "Cukup untuk hari besar Anda",
    features: [
      { label: "Semua tema standar", included: true },
      { label: "Aktif 30 hari", included: true },
      { label: "RSVP & ucapan", included: true },
      { label: "Countdown & lokasi acara", included: true },
      { label: "Galeri maks. 10 foto", included: true },
      { label: "Musik latar", included: true },
      { label: "Amplop digital / titip kado", included: true },
      { label: "Tanpa watermark", included: true },
      { label: "QR check-in tamu", included: false },
      { label: "Aktif selamanya", included: false },
    ],
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    price: 99000,
    durationDays: null,
    tagline: "Fitur paling lengkap, sekali bayar",
    highlight: true,
    features: [
      { label: "Semua tema termasuk premium", included: true },
      { label: "Aktif selamanya", included: true },
      { label: "RSVP & ucapan + balasan", included: true },
      { label: "Countdown & lokasi acara", included: true },
      { label: "Galeri unlimited", included: true },
      { label: "Musik latar", included: true },
      { label: "Amplop digital / titip kado", included: true },
      { label: "Tanpa watermark", included: true },
      { label: "QR check-in tamu", included: true },
      { label: "Prioritas dukungan", included: true },
    ],
  },
};

export function isFeatureUnlocked(plan: string, featureKey: string): boolean {
  const p = PLANS[(plan as PlanId) in PLANS ? (plan as PlanId) : "FREE"];
  switch (featureKey) {
    case "music": return p.features.find(f => f.label === "Musik latar")?.included ?? false;
    case "gift": return p.features.find(f => f.label.startsWith("Amplop"))?.included ?? false;
    case "watermark": return !p.features.find(f => f.label === "Tanpa watermark")!.included;
    case "qr": return p.features.find(f => f.label === "QR check-in tamu")?.included ?? false;
    default: return false;
  }
}

export function galleryLimit(plan: string): number {
  if (plan === "PREMIUM") return 100;
  if (plan === "BASIC") return 10;
  return 4;
}
