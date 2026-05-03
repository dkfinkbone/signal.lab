"use client";

import { useState } from "react";

export default function BulkUploadPage() {
  const [json, setJson] = useState("");
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const parsed = JSON.parse(json);
      const articles = Array.isArray(parsed) ? parsed : [parsed];
      const res = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ inserted: 0, errors: [err instanceof Error ? err.message : "JSON parse error"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Bulk Upload</h1>
      <p className="text-sm text-gray-500 mb-6">
        Paste a JSON array of articles. Required fields: <code>slug</code>, <code>headline</code>.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder={'[\n  {\n    "slug": "my-article",\n    "headline": "My Article",\n    "summary": "...",\n    "full_body": "...",\n    "status": "draft"\n  }\n]'}
          rows={18}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <button
          type="submit"
          disabled={loading || !json.trim()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading…" : "Upload Articles"}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.errors.length ? "bg-yellow-50 border border-yellow-200" : "bg-green-50 border border-green-200"}`}>
          <p className="font-semibold text-sm mb-2">
            {result.inserted} article{result.inserted !== 1 ? "s" : ""} inserted.
          </p>
          {result.errors.length > 0 && (
            <ul className="text-xs text-red-700 space-y-1">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
