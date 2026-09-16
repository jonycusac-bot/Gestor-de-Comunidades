import React from "react";
import "./globals.css";

export interface Metadata {
  title: string;
  description: string;
}

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
