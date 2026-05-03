import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "signal.lab | Personal IP Knowledge Hub",
  description: "Publish your expertise and relationships to the semantic web. Optimized for LLMs and AI Agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <nav className="navbar">
          <div className="container flex-between">
            <a href="/" className="brand">signal<span>.lab</span></a>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/dashboard" className="btn-glass" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Dashboard</a>
              <a href="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Sign In</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
