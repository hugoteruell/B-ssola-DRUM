import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bússola DRUM",
  description: "Encontre uma direção testável em 15 minutos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
