import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Micro Feed",
  description: "A tiny micro-blogging platform built with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
