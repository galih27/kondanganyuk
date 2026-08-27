import type { Metadata } from "next";
import localFont from "next/font/local";
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

const scriptina = localFont({
  variable: "--font-scriptina",
  src: "../assets/fonts/SCRIPTIN.ttf",
  weight: "400",
  display: "swap",
});

const magnoliaSky = localFont({
  variable: "--font-magnolia",
  src: "../assets/fonts/magnolia_sky.ttf",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kondanganyuk.vercel.app"),
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
      <body className={`${poppins.variable} ${playfair.variable} ${greatVibes.variable} ${cormorant.variable} ${fredoka.variable} ${scriptina.variable} ${magnoliaSky.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
