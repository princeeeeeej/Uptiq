import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

import InteractiveGrid from "@/ui/InteractiveGrid";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uptiq | Premium Multi-Region Infrastructure Uptime & Monitoring",
  description: "Millisecond-perfect global uptime monitoring engineered for modern DevOps teams. Get instant alerts, multi-region checks, and detailed incident timelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b]">
        <InteractiveGrid />

        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

