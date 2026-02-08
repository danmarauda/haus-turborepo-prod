import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HAUS | Premium Property Appraisal Platform",
  description:
    "Professional property appraisal and valuation platform. Streamline your appraisal workflow with comprehensive market analysis, comparable sales data, and automated report generation.",
  keywords: [
    "property appraisal",
    "real estate valuation",
    "market analysis",
    "comparable sales",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          `${inter.variable} ${jetbrainsMono.variable}`,
          "font-sans antialiased",
        )}
      >
        {children}
      </body>
    </html>
  );
}
