import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Khronos Maps — Carreras Populares en España",
  description:
    "Descubre y filtra carreras populares en toda España con un mapa interactivo. Road, trail, cross y ultra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
