import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Seating & Guest Entry",
  description: "Upload, organize and share your event seating in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
