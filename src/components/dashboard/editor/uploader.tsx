"use client";

import { useRef, useState } from "react";

export interface UploadedItem {
  url: string;
  kind: string;
  filename: string;
}

/** Hook unggah berkas via XHR agar bisa menampilkan progres. */
export function useUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | File[], onDone: (items: UploadedItem[]) => void) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    setProgress(0);
    setError(null);

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/media");
      const form = new FormData();
      list.forEach((f) => form.append("files", f));
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && json.ok) {
            onDone(json.items);
          } else {
            setError(json.error || "Gagal mengunggah.");
          }
        } catch {
          if (xhr.status === 413) {
            setError("Ukuran berkas terlalu besar untuk server hosting (maks sekitar 4 MB per berkas).");
          } else {
            setError(`Respons server tidak valid (kode ${xhr.status || "—" }).`);
          }
        }
        resolve();
      };
      xhr.onerror = () => {
        setError("Koneksi terputus saat mengunggah.");
        resolve();
      };
      xhr.send(form);
    });

    setUploading(false);
    setProgress(0);
  }

  return { uploading, progress, error, upload };
}

/** Area unggah bergaya dropzone — klik untuk memilih berkas. */
export function UploadZone({
  accept,
  multiple = false,
  label,
  hint,
  icon,
  onUploaded,
}: {
  accept: string;
  multiple?: boolean;
  label: string;
  hint?: string;
  icon: string;
  onUploaded: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, error, upload } = useUploader();

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            upload(e.target.files, (items) => onUploaded(items.map((it) => it.url)));
          }
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/60 px-4 py-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40 disabled:cursor-wait disabled:opacity-70"
      >
        <span className="text-2xl">{uploading ? "⏳" : icon}</span>
        <span className="text-sm font-semibold text-stone-700">
          {uploading ? `Mengunggah... ${progress}%` : label}
        </span>
        {hint && !uploading && <span className="text-xs text-stone-400">{hint}</span>}
        {uploading && (
          <span className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-stone-200">
            <span
              className="block h-full rounded-full bg-brand-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </span>
        )}
      </button>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
