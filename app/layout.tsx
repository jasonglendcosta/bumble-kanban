import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Bumble Kanban | GOD MODE",
  description: "Premium kanban system with agents, automation, and flow."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="min-h-screen bg-night text-white">
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(216,109,203,0.12),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(96,165,250,0.12),transparent_35%)]" />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
