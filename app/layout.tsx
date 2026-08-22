import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Body Laser - Consultation laser medicale",
  description:
    "Landing Body Laser pour consultation epilation laser medicale Alexandrite + Nd:YAG.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
