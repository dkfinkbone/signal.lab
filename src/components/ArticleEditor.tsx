"use client";

import Link from "next/link";
import { useState } from "react";
import type { Article } from "@/types";

interface Props {
  article?: Partial<Article>;
  isNew?: boolean;
}

export default function ArticleEditor({ article = {}, isNew = false }: Props) {
  const [form, setForm] = useState<Partial<Article>>({
    slug: "",
    headline: "",
    summary: "",
    full_body: "",
    category: "",
    tags: [],
    claim: "",
    evidence_source: "",
    author_name: "",
    author_email: "",
    company: "",
    role: "",
    cta_label: "",
    cta_url: "",
    status: "draft",
    ...article,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const set =
    (field: keyof Article) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = isNew ? "/api/admin/articles" : `/api/admin/articles/${article.id}`;
      const method = isNew ? "POST" : "PATCH";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Save failed");

      setMessage({ type: "success", text: isNew ? "Article created." : "Saved." });
      if (isNew && data.id) {
        window.location.href = `/admin/articles/${data.id}`;
      }
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status === "published" ? "draft" : "published",
          published_at:
            form.status === "published" ? null : new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Status update failed");
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  const field = (
    label: string,
    key: keyof Article,
    type = "text",
    required = false
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        value={(form[key] as string) ?? ""}
        onChange={set(key)}
        required={required}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <form onSubmit={handleSave} className="space-y-2">
      {message && (
        <div
          className={`p-3 rounded-md text-sm mb-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {field("Slug", "slug", "text", true)}
        {field("Category", "category")}
      </div>

      {field("Headline", "headline", "text", true)}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Summary *
        </label>
        <textarea
          value={form.summary ?? ""}
          onChange={(event) =>
            setForm((current) => ({ ...current, summary: event.target.value }))
          }
          required
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Body (HTML)
        </label>
        <textarea
          value={form.full_body ?? ""}
          onChange={(event) =>
            setForm((current) => ({ ...current, full_body: event.target.value }))
          }
          rows={12}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {field("Claim", "claim")}
      {field("Evidence Source", "evidence_source")}

      <div className="grid grid-cols-2 gap-4">
        {field("Author Name", "author_name")}
        {field("Author Email", "author_email", "email")}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field("Company", "company")}
        {field("Role", "role")}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field("CTA Label", "cta_label")}
        {field("CTA URL", "cta_url", "url")}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={(form.tags ?? []).join(", ")}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              tags: event.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            }))
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={form.status ?? "draft"}
          onChange={set("status")}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving}
            className={`px-5 py-2 rounded-lg text-sm border ${
              form.status === "published"
                ? "border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                : "border-green-500 text-green-700 hover:bg-green-50"
            }`}
          >
            {form.status === "published" ? "Unpublish" : "Publish"}
          </button>
        )}
        <Link
          href="/admin/articles"
          className="px-5 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
