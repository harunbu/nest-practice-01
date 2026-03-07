import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nest-practice-01",
  description: "Next.js and NestJS monorepo practice app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
