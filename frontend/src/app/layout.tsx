import type { Metadata } from "next";
import { Fredoka, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { OfflineSyncProvider } from "@/components/OfflineSyncProvider";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Cafe POS",
  description: "Bakery & Cafe Point of Sale System",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`antialiased h-full ${inter.variable} ${fredoka.variable} ${jetbrainsMono.variable}`}
    >
      <body className="h-full bg-[var(--bg-page)] text-[var(--text-primary)] font-sans flex flex-col">
        <AuthProvider>
          <OfflineSyncProvider />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--espresso-900)",
                color: "var(--text-on-dark)",
                border: "1px solid var(--espresso-700)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
              },
              success: {
                iconTheme: {
                  primary: "var(--status-success)",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--status-danger)",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
