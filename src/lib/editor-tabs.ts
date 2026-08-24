export const EDITOR_TABS = [
  { id: "konten", label: "Konten Utama", icon: "📝" },
  { id: "acara", label: "Acara & Lokasi", icon: "📅" },
  { id: "cerita", label: "Cerita & Kutipan", icon: "📖" },
  { id: "galeri", label: "Galeri & Musik", icon: "🖼️" },
  { id: "amplop", label: "Amplop Digital", icon: "🎁" },
  { id: "tema", label: "Tema & Link", icon: "🎨" },
  { id: "tamu", label: "Daftar Tamu", icon: "👥" },
] as const;

export type EditorTabId = (typeof EDITOR_TABS)[number]["id"];

export function normalizeTab(value: string | null): EditorTabId {
  return EDITOR_TABS.some((t) => t.id === value) ? (value as EditorTabId) : "konten";
}
