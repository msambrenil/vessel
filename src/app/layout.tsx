import type { Metadata, Viewport } from "next";
import "./globals.css";
import { VesselProvider } from "@/context/VesselContext";

export const metadata: Metadata = {
  title: "VESSEL — Built to Receive",
  description:
    "High-end carnal encounters and brutalist queer radar. The body is a vessel. Claim it.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VESSEL",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="bg-obsidian min-h-screen text-white antialiased" suppressHydrationWarning>
        <VesselProvider>{children}</VesselProvider>
      </body>
    </html>
  );
}
