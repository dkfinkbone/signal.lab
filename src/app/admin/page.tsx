import Link from "next/link";
import { getServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const client = getServiceClient();

  const [articlesRes, eventsRes, accessRes] = await Promise.all([
    client.from("articles").select("id, status", { count: "exact" }),
    client.from("request_events").select("id", { count: "exact" }),
    client.from("access_requests").select("id, status", { count: "exact" }),
  ]);

  const totalArticles = articlesRes.count ?? 0;
  const published =
    articlesRes.data?.filter((article) => article.status === "published").length ?? 0;
  const totalEvents = eventsRes.count ?? 0;
  const pendingAccessRequests =
    accessRes.data?.filter((request) => request.status === "new" || request.status === "reviewed")
      .length ?? 0;

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">Overview</h1>
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Articles</p>
          <p className="text-3xl font-bold mt-1">{totalArticles}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-3xl font-bold mt-1 text-green-600">{published}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Request Events</p>
          <p className="text-3xl font-bold mt-1">{totalEvents}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending Join Requests</p>
          <p className="text-3xl font-bold mt-1 text-amber-600">{pendingAccessRequests}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Link
          href="/admin/articles"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Manage Articles -&gt;
        </Link>
        <Link
          href="/admin/upload"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          Bulk Upload -&gt;
        </Link>
        <Link
          href="/admin/dashboard"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          Attribution Dashboard -&gt;
        </Link>
        <Link
          href="/admin/access-requests"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          Review Join Requests -&gt;
        </Link>
      </div>
    </>
  );
}
