// Struktur data konten undangan yang bisa diedit user.
// Disimpan sebagai JSON string di kolom Invitation.data.

export type EventDetail = {
  name: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string;
  place: string;
  address: string;
  mapsUrl: string;
  mapsEmbed: string; // peta manual: kode <iframe> / URL embed / koordinat
};

export type StoryItem = { date: string; title: string; text: string };
export type BankAccount = { bank: string; number: string; holder: string };

export interface InvitationData {
  // Pernikahan
  groomName: string; // panggilan
  groomFull: string; // lengkap
  groomPhoto: string; // URL foto potret
  groomParents: string;
  brideName: string;
  brideFull: string;
  bridePhoto: string;
  brideParents: string;
  coupleOrder: "pria-wanita" | "wanita-pria"; // urutan tampil di seksi Mempelai
  coverNameType: "nickname" | "initial"; // nama panggilan atau inisial di halaman pembuka
  dressCode: string; // cth: Batik, Bebas rapi

  // Kategori non-wedding (khitan/aqiqah/ulang tahun/event)
  personName: string;
  personDetail: string;

  quoteText: string;
  quoteSource: string;

  events: EventDetail[];
  story: StoryItem[];

  galleryUrls: string[]; // foto
  galleryVideos: string[]; // video
  musicUrl: string;

  banks: BankAccount[];
  giftAddress: string;

  streamingUrl: string;
  closingNote: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  WEDDING: "Pernikahan",
  KHITAN: "Khitanan",
  AQIQAH: "Aqiqah",
  BIRTHDAY: "Ulang Tahun",
  EVENT: "Event / Syukuran",
};

export function emptyInvitationData(): InvitationData {
  return {
    groomName: "",
    groomFull: "",
    groomPhoto: "",
    groomParents: "",
    brideName: "",
    brideFull: "",
    bridePhoto: "",
    brideParents: "",
    coupleOrder: "pria-wanita",
    coverNameType: "nickname",
    dressCode: "",
    personName: "",
    personDetail: "",
    quoteText: "",
    quoteSource: "",
    events: [
      {
        name: "Akad Nikah",
        date: "",
        startTime: "08:00",
        endTime: "10:00",
        place: "",
        address: "",
        mapsUrl: "",
        mapsEmbed: "",
      },
      {
        name: "Resepsi",
        date: "",
        startTime: "11:00",
        endTime: "14:00",
        place: "",
        address: "",
        mapsUrl: "",
        mapsEmbed: "",
      },
    ],
    story: [],
    galleryUrls: [],
    galleryVideos: [],
    musicUrl: "",
    banks: [{ bank: "", number: "", holder: "" }],
    giftAddress: "",
    streamingUrl: "",
    closingNote: "",
  };
}

/** Pastikan JSON dari DB selalu punya semua field (aman terhadap versi lama). */
export function normalizeInvitationData(raw: unknown): InvitationData {
  const base = emptyInvitationData();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  const merged = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(base)) {
    if (obj[key] !== undefined && obj[key] !== null) merged[key] = obj[key];
  }
  // Data lama: isi mapsEmbed kosong pada setiap acara
  if (Array.isArray(merged.events)) {
    merged.events = (merged.events as Array<Record<string, unknown>>).map((e) => ({
      mapsEmbed: "",
      ...e,
    }));
  }
  // Data lama: nilai coupleOrder yang tidak valid dikembalikan ke bawaan
  if (obj["coupleOrder"] !== "wanita-pria") merged["coupleOrder"] = "pria-wanita";
  // Data lama: nilai coverNameType yang tidak valid dikembalikan ke bawaan
  if (obj["coverNameType"] !== "initial") merged["coverNameType"] = "nickname";
  return merged as unknown as InvitationData;
}
