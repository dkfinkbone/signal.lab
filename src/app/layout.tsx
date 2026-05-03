import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Signal.lab", template: "%s | Signal.lab" },
  description: "Agent-readable publishing platform for expert knowledge nodes.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-100 py-4 px-6">
          <nav className="max-w-4xl mx-auto flex items-center justify-between gap-6 text-sm font-medium">
            <Link href="/" className="text-gray-900 hover:text-blue-600">
              Signal.lab
            </Link>
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/insights" className="text-gray-600 hover:text-blue-600">
                Insights
              </Link>
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-blue-600">
                Attribution
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                Admin
              </Link>
            </div>
          </nav>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
        <footer className="border-t border-gray-100 py-6 px-6 text-center text-xs text-gray-400">
          (c) {new Date().getFullYear()} Signal.lab | Knowledge for humans and machines
        </footer>
      </body>
    </html>
  );
}
