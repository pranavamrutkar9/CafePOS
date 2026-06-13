import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { OfflineSyncProvider } from "@/components/OfflineSyncProvider";
import { AuthProvider } from "@/context/AuthContext";

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
    <html lang="en" className="antialiased h-full">
      <body className="h-full bg-cafe-bg text-cafe-text font-sans flex flex-col">
        <AuthProvider>
          <OfflineSyncProvider />
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#2a2a2a',
                color: '#f0f0f0',
                border: '1px solid #444',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#27ae60',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#c0392b',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
