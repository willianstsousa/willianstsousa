import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Willians Torres | Desenvolvedor",
    template: "%s | Willians Torres",
  },
  description:
    "Portfólio de Willians Torres, desenvolvedor de aplicações web com JavaScript, TypeScript, React e Node.js.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Willians Torres | Desenvolvedor",
    description:
      "Aplicações web construídas com clareza, confiabilidade e foco no produto.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Willians Torres — Software com clareza." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Willians Torres | Desenvolvedor",
    description:
      "Aplicações web construídas com clareza, confiabilidade e foco no produto.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
