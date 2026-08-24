import type { Metadata } from "next";
import { Great_Vibes, Playfair_Display, Poppins, Cormorant_Garamond, Fredoka } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-greatvibes",
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kondanganyuk — Buat Undangan Digital Online",
    template: "%s | Kondanganyuk",
  },
  description:
    "Buat website undangan digital pernikahan, khitanan, aqiqah & acara lainnya dalam hitungan menit. Pilih tema, atur isi, bagikan link personal ke setiap tamu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${poppins.variable} ${playfair.variable} ${greatVibes.variable} ${cormorant.variable} ${fredoka.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
