import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/auth/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "⚔️ Knight Online Artı Basma Oyunu | Nostaljik KO Upgrade Deneyimi",
  description: "Knight Online tarzı upgrade sistemi! +1'den +10'a çık, nostaljik KO deneyimini yaşa. Güvenli taş, başarısızlık, gerçek KO oranları!",
  keywords: "knight online, ko, upgrade, artı basma, oyun, nostalji, mmorpg",
  manifest: "/manifest.json",
  openGraph: {
    title: "⚔️ Knight Online Artı Basma Oyunu",
    description: "Nostaljik KO upgrade deneyimi! +1'den +10'a çıkar!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.className}>
      <body className="antialiased">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
