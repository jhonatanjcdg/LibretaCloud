import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LibretaCloud | Gestión Empresarial Inteligente",
  description: "La plataforma administrativa y contable más moderna para potenciar tu negocio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${outfit.className} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
