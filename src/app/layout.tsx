import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Top Level Server (TLS) — Enterprise Game & Cloud VPS Hosting",
  description:
    "Deploy high-performance Minecraft, CS2, Palworld, and Rust servers with <15ms latency across Southeast Asia. Powered by AMD Ryzen 9 7950X, NVMe Gen4 storage, and Anycast DDoS protection.",
  keywords: [
    "Game Server Hosting",
    "Minecraft Server Indonesia",
    "CS2 Dedicated Server",
    "Palworld Host",
    "Rust Game Server",
    "Cloud VPS",
    "Top Level Server",
    "TLS Host",
  ],
  authors: [{ name: "Top Level Server Team" }],
  metadataBase: new URL("https://nayeony.my.id"),
  openGraph: {
    title: "Top Level Server (TLS) — Ultra Low Latency Game Hosting",
    description: "Enterprise game server hosting and high-frequency cloud instances in Jakarta & Singapore.",
    url: "https://nayeony.my.id",
    siteName: "Top Level Server",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      data-theme="night"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">
        {children}
      </body>
    </html>
  );
}
