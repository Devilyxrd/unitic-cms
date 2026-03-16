import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { AdminShell } from "@/shared/components/admin-shell";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unitic CMS Yönetim",
  description: "Unitic CMS için yönetim paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <AdminShell>{children}</AdminShell>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#0f1420",
              color: "#e2e8f0",
              border: "1px solid #1f293a",
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 4500,
            },
          }}
        />
      </body>
    </html>
  );
}
