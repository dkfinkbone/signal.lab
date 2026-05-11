import Link from "next/link";
import AccessRequestQueue from "@/components/AccessRequestQueue";
import { listAccessRequestsAdmin } from "@/lib/access-requests";
import type { AccessRequest } from "@/types";

export const dynamic = "force-dynamic";

export default async function AccessRequestsPage() {
  const requests = (await listAccessRequestsAdmin()) as AccessRequest[];
  const newCount = requests.filter((request) => request.status === "new").length;
  const reviewedCount = requests.filter((request) => request.status === "reviewed").length;
  const invitedCount = requests.filter((request) => request.status === "invited").length;
  const rejectedCount = requests.filter((request) => request.status === "rejected").length;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
            Join Queue
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Access Requests</h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-600">
            Review inbound join requests, issue invite links, reject poor-fit
            applicants, and keep notes attached to each request.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Back to Admin
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard label="New" value={newCount} tone="slate" />
        <StatCard label="Reviewed" value={reviewedCount} tone="amber" />
        <StatCard label="Invited" value={invitedCount} tone="emerald" />
        <StatCard label="Rejected" value={rejectedCount} tone="rose" />
      </div>

      <AccessRequestQueue initialRequests={requests} />
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "amber" | "emerald" | "rose";
}) {
  const toneClasses = {
    slate: "border-gray-200 bg-white text-gray-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
  } as const;

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses[tone]}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
