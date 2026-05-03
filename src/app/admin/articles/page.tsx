import Link from "next/link";
import { getServiceClient } from "@/lib/supabase-service";

export default async function AdminArticlesPage() {
  const client = getServiceClient();
  const { data: articles } = await client
    .from("articles")
    .select("id, slug, headline, status, category, published_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + New Article
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Headline</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Published</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(articles ?? []).map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium max-w-sm truncate">{article.headline}</td>
                <td className="px-4 py-3 text-gray-500">{article.category || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      article.status === "published"
                        ? "bg-green-100 text-green-700"
                        : article.status === "archived"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString("en-GB")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!articles?.length && (
          <p className="px-4 py-8 text-center text-gray-400">No articles yet.</p>
        )}
      </div>
    </>
  );
}
