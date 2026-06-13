import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OfflineSyncProvider } from "@/components/OfflineSyncProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Odoo Cafe POS",
  description: "Restaurant POS System",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased h-full`}>
      <body className="h-full bg-cafe-bg text-gray-900 font-sans flex flex-col">
        <OfflineSyncProvider />
        {children}
      </body>
    </html>
  );
}
