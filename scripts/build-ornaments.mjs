// Pipeline aset ornamen CC0 (Openclipart) → optimasi SVGO → warna currentColor.
// Output: public/ornaments/*.svg + src/components/themes/generated-ornaments.ts
// Jalankan: node scripts/build-ornaments.mjs
import { readFileSync, writeFileSync, mkdirSync, statSync } from "fs";
import { optimize } from "svgo";

const PICKS = [
  { in: "C:/tmp/orn/pool/floral-1-301667.svg", name: "floral-corner", credit: "Openclipart #301667 (CC0)" },
  { in: "C:/tmp/orn/pool/floral-3-255404.svg", name: "corner-expanded", credit: "Openclipart #255404 (CC0)" },
  { in: "C:/tmp/orn/pool/arabesque-2-304631.svg", name: "calligraphy-frame", credit: "Openclipart #304631 (CC0)" },
  { in: "C:/tmp/orn/pool/party-1-194443.svg", name: "balloon-border", credit: "Openclipart #194443 (CC0)" },
  { in: "C:/tmp/orn/pool/divider-4-317243.svg", name: "flourish-divider", credit: "Openclipart #317243 (CC0)" },
  { in: "C:/tmp/orn/pool/gunungan-original.svg", name: "gunung-silhouette", credit: "Karya original kondanganyuk" },
];

const currentColorPlugin = {
  name: "currentColor",
  fn: () => ({
    element: {
      enter(node) {
        for (const att of ["fill", "stroke"]) {
          const v = node.attributes[att];
          if (v && v !== "none" && v !== "transparent") node.attributes[att] = "currentColor";
        }
        if (node.attributes.style) {
          node.attributes.style = node.attributes.style
            .replace(/(fill|stroke)\s*:\s*(?!none|transparent)[^;"}]+/gi, "$1: currentColor")
            .trim();
          if (!node.attributes.style) delete node.attributes.style;
        }
      },
    },
  }),
};

mkdirSync("public/ornaments", { recursive: true });
const out = {};
for (const p of PICKS) {
  const raw = readFileSync(p.in, "utf8");
  const res = optimize(raw, {
    multipass: true,
    plugins: ["preset-default", { name: "removeViewBox", active: false }, currentColorPlugin],
  });
  let svg = res.data.replace(/\swidth="[^"]*"\s/, " ").replace(/\sheight="[^"]*"\s/, " ");
  out[p.name] = svg;
  writeFileSync(`public/ornaments/${p.name}.svg`, svg);
  console.log(
    `${p.name.padEnd(18)} ${(statSync(p.in).size / 1024).toFixed(1)} KB -> ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`
  );
}

const banner = `// DIHASILKAN OTOMATIS oleh scripts/build-ornaments.mjs - jangan edit manual.
// Sumber: Openclipart, semua CC0 (Domain Publik).
`;
const ts =
  banner +
  "export const ORNAMENT_SVGS: Record<string, string> = {\n" +
  Object.entries(out)
    .map(([k, v]) => `  "${k}": ${JSON.stringify(v)},`)
    .join("\n") +
  "\n};\n\nexport const ORNAMENT_CREDITS: Record<string, string> = {\n" +
  PICKS.map((p) => `  "${p.name}": ${JSON.stringify(p.credit)},`).join("\n") +
  "\n};\n";
writeFileSync("src/components/themes/generated-ornaments.ts", ts);
console.log("generated-ornaments.ts ditulis.");
