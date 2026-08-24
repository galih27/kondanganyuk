// Registry tema undangan — seluruh desain dibuat original.
// Setiap tema adalah preset identitas visual yang dirender oleh engine di src/components/themes/.

export interface ThemePalette {
  bg: string; // latar utama
  surface: string; // kartu / panel
  accent: string; // warna aksen utama
  accent2: string; // aksen sekunder
  text: string;
  textMuted: string;
}

/** Ornamen SVG CC0 tambahan per tema — berkas dikelola lewat scripts/build-ornaments.mjs */
export interface ThemeArt {
  /** Hiasan sudut untuk cover */
  corners?: string;
  /** Bingkai besar di belakang konten cover */
  frame?: string;
  /** Transparansi strip awan bawah (0-100) untuk tema ber-coverDecor */
  cloudsOpacity?: number;
  /** Latar dekoratif lembut di cover */
  backdrop?: string;
}

export interface ThemeDef {
  id: string;
  name: string;
  categories: string[]; // kategori yang cocok
  premium?: boolean;
  description: string;
  palette: ThemePalette;
  fontHeading: "serif-elegant" | "script" | "modern" | "playful" | "classic";
  fontBody: "sans" | "serif";
  ornament: "floral" | "geometric" | "islamic" | "confetti" | "minimal";
  coverStyle: "centered" | "framed" | "top-photo";
  dark: boolean;
   gradient: [string, string]; // gradasi latar cover
   art?: ThemeArt;
   /** Lapisan gambar dekoratif raster di cover (posisi via className Tailwind) */
   coverDecor?: { src: string; className: string }[];
 }

export const THEMES: ThemeDef[] = [
  {
    id: "amara",
    name: "Amara",
    categories: ["WEDDING"],
    premium: true,
    description: "Elegan klasik dengan sentuhan emas dan tipografi serif mewah",
    palette: {
      bg: "#12100c", surface: "#1d1913", accent: "#d4af6a", accent2: "#8a6f3f",
      text: "#f4ead8", textMuted: "#a99e8a",
    },
    fontHeading: "script", fontBody: "serif",
    ornament: "floral", coverStyle: "centered", dark: true,
    gradient: ["#12100c", "#2b2115"],
    art: { corners: "floral-corner" },
  },
  {
    id: "sakura",
    name: "Sakura Blush",
    categories: ["WEDDING", "AQIQAH"],
    description: "Romantis lembut bernuansa merah muda dengan ornamen bunga",
    palette: {
      bg: "#fdf3f4", surface: "#ffffff", accent: "#d97a8c", accent2: "#b45268",
      text: "#5c3a42", textMuted: "#9c7a82",
    },
    fontHeading: "script", fontBody: "sans",
    ornament: "floral", coverStyle: "framed", dark: false,
    gradient: ["#fdf3f4", "#fbe0e5"],
    art: { corners: "floral-corner" },
  },
  {
    id: "lentera",
    name: "Lentera",
    categories: ["WEDDING"],
    description: "Nuansa nusantara hangat, cocok untuk adat Jawa dan tradisional",
    palette: {
      bg: "#fbf6ec", surface: "#fffdf7", accent: "#9a6a32", accent2: "#6b4a23",
      text: "#43331e", textMuted: "#8a7658",
    },
    fontHeading: "classic", fontBody: "serif",
    ornament: "geometric", coverStyle: "framed", dark: false,
    gradient: ["#fbf6ec", "#f3e7cf"],
    art: { corners: "corner-expanded" },
  },
  {
    id: "wayang",
    name: "Wayang",
    categories: ["WEDDING"],
    premium: true,
    description: "Tradisi Jawa dengan siluet gunungan, krem hangat dan teal klasik",
    palette: {
      bg: "#f5eee1", surface: "#fdf8ef", accent: "#064346", accent2: "#8a5a33",
      text: "#3d251b", textMuted: "#7d6a58",
    },
    fontHeading: "classic", fontBody: "serif",
    ornament: "geometric", coverStyle: "framed", dark: false,
    gradient: ["#f5eee1", "#edd5c5"],
    coverDecor: [
      { src: "/themes/wayang/gunungan.webp", className: "absolute top-1/2 left-1/2 z-0 w-60 -translate-x-1/2 -translate-y-1/2 opacity-20 sm:w-80" },
      { src: "/themes/wayang/awan-kiri.webp", className: "absolute top-0 left-0 z-0 w-40 opacity-90 sm:w-56" },
      { src: "/themes/wayang/awan-kanan.webp", className: "absolute top-0 right-0 z-0 w-40 opacity-90 sm:w-56" },
      { src: "/themes/wayang/awan-bawah.png", className: "absolute bottom-0 left-0 z-0 w-full" },
    ],
  },
  {
    id: "malam",
    name: "Malam Bintang",
    categories: ["WEDDING", "EVENT"],
    premium: true,
    description: "Modern dramatis dengan latar malam biru dan cahaya lembut",
    palette: {
      bg: "#0b1026", surface: "#141a36", accent: "#8fa8ff", accent2: "#5f74d6",
      text: "#eef1ff", textMuted: "#98a1c7",
    },
    fontHeading: "modern", fontBody: "sans",
    ornament: "geometric", coverStyle: "top-photo", dark: true,
    gradient: ["#0b1026", "#1b2450"],
  },
  {
    id: "sabrina",
    name: "Sabrina",
    categories: ["WEDDING"],
    description: "Minimalis bersih dengan aksen hijau sage yang tenang",
    palette: {
      bg: "#f6f7f3", surface: "#ffffff", accent: "#7c9070", accent2: "#55684c",
      text: "#37402f", textMuted: "#7d8672",
    },
    fontHeading: "modern", fontBody: "sans",
    ornament: "minimal", coverStyle: "centered", dark: false,
    gradient: ["#f6f7f3", "#e8ece2"],
  },
  {
    id: "ceria",
    name: "Ceria",
    categories: ["KHITAN", "BIRTHDAY", "AQIQAH"],
    description: "Ceria playful penuh warna untuk khitanan & ulang tahun",
    palette: {
      bg: "#fffbea", surface: "#ffffff", accent: "#ff8a3d", accent2: "#2aa7dd",
      text: "#3d3428", textMuted: "#8d8069",
    },
    fontHeading: "playful", fontBody: "sans",
    ornament: "confetti", coverStyle: "centered", dark: false,
    gradient: ["#fffbea", "#ffeccf"],
    art: { backdrop: "balloon-border" },
  },
  {
    id: "barokah",
    name: "Barokah",
    categories: ["KHITAN", "AQIQAH", "WEDDING"],
    description: "Islami syar'i dengan hijau zamrud dan ornamen geometris",
    palette: {
      bg: "#f2f7f2", surface: "#ffffff", accent: "#1f7a5c", accent2: "#c9a227",
      text: "#22352c", textMuted: "#6f857a",
    },
    fontHeading: "classic", fontBody: "sans",
    ornament: "islamic", coverStyle: "framed", dark: false,
    gradient: ["#f2f7f2", "#dcece2"],
    art: { frame: "calligraphy-frame" },
  },
  {
    id: "monokrom",
    name: "Monokrom",
    categories: ["WEDDING", "EVENT", "BIRTHDAY"],
    description: "Hitam putih timeless untuk tampilan berkelas",
    palette: {
      bg: "#111111", surface: "#1b1b1b", accent: "#e8e8e8", accent2: "#9a9a9a",
      text: "#f5f5f5", textMuted: "#9c9c9c",
    },
    fontHeading: "modern", fontBody: "sans",
    ornament: "minimal", coverStyle: "top-photo", dark: true,
    gradient: ["#111111", "#262626"],
  },
];

export function getTheme(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
