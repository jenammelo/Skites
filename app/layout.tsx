import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Event Seating & Guest Entry",
  description: "Upload, organize and share your event seating in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={displayFont.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}