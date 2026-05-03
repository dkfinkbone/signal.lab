import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6 text-sm">
          <span className="font-bold text-gray-900">Signal.lab Admin</span>
          <Link href="/admin" className="text-gray-600 hover:text-blue-600">
            Dashboard
          </Link>
          <Link href="/admin/articles" className="text-gray-600 hover:text-blue-600">
            Articles
          </Link>
          <Link href="/admin/upload" className="text-gray-600 hover:text-blue-600">
            Bulk Upload
          </Link>
          <Link href="/admin/dashboard" className="text-gray-600 hover:text-blue-600">
            Attribution
          </Link>
          <Link href="/" className="ml-auto text-gray-400 hover:text-blue-600 text-xs">
            &larr; View site
          </Link>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
