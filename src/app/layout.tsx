import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FincaFlow — Gestión de comunidades",
  description: "Panel de gestión multi-comunidad para administradores de fincas",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
