"use client";

import { useMemo, useState } from "react";
import type { AccessRequest } from "@/types";

type Filter = "all" | AccessRequest["status"];
type QueueMessage = { type: "success" | "error"; text: string } | null;

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "invited", label: "Invited" },
  { value: "rejected", label: "Rejected" },
];

function badgeClasses(status: AccessRequest["status"]) {
  switch (status) {
    case "new":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "reviewed":
      return "border-amber-200 bg-amber-100 text-amber-800";
    case "invited":
      return "border-emerald-200 bg-emerald-100 text-emerald-800";
    case "rejected":
      return "border-rose-200 bg-rose-100 text-rose-800";
  }
}

function buildInviteUrl(token: string) {
  if (typeof window === "undefined") {
    return `/join/${encodeURIComponent(token)}`;
  }

  return `${window.location.origin}/join/${encodeURIComponent(token)}`;
}

export default function AccessRequestQueue({
  initialRequests,
}: {
  initialRequests: AccessRequest[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<Filter>("all");
  const [notesById, setNotesById] = useState<Record<string, string>>(
    Object.fromEntries(initialRequests.map((request) => [request.id, request.notes ?? ""]))
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<QueueMessage>(null);

  const filteredRequests = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter((request) => request.status === filter);
  }, [filter, requests]);

  async function runAction(
    request: AccessRequest,
    action: "save" | "review" | "approve" | "reject" | "reopen",
    options?: { regenerateInviteToken?: boolean }
  ) {
    setBusyId(request.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/access-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: notesById[request.id] ?? "",
          regenerateInviteToken: options?.regenerateInviteToken ?? false,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        request?: AccessRequest;
      };

      if (!response.ok || !payload.request) {
        throw new Error(payload.error ?? "Unable to update the access request.");
      }

      setRequests((current) =>
        current.map((entry) => (entry.id === payload.request!.id ? payload.request! : entry))
      );
      setNotesById((current) => ({
        ...current,
        [payload.request!.id]: payload.request!.notes ?? "",
      }));

      if (action === "approve" && payload.request.invite_token) {
        setMessage({
          type: "success",
          text: `Invite ready for ${payload.request.email}. Copy or email the join link from the card below.`,
        });
      } else {
        setMessage({
          type: "success",
          text: `Updated ${payload.request.email} to ${payload.request.status}.`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to update the access request.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function copyInviteLink(request: AccessRequest) {
    if (!request.invite_token) return;

    try {
      await navigator.clipboard.writeText(buildInviteUrl(request.invite_token));
      setMessage({
        type: "success",
        text: `Copied invite link for ${request.email}.`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Unable to copy the invite link from this browser.",
      });
    }
  }

  function openDraftEmail(request: AccessRequest) {
    if (!request.invite_token) return;

    const inviteUrl = buildInviteUrl(request.invite_token);
    const subject = "Your Signal.lab invite";
    const body = [
      `Hi ${request.name},`,
      "",
      "Your Signal.lab request has been approved.",
      "",
      `Use this invite link to start onboarding: ${inviteUrl}`,
      "",
      "Once you land on the invite page, continue with your approved work email to receive the verification magic link.",
      "",
      "Best,",
      "Signal.lab",
    ].join("\n");

    window.location.href = `mailto:${encodeURIComponent(request.email)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {FILTERS.map((option) => {
          const active = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500">
          No access requests match this filter yet.
        </div>
      ) : (
        filteredRequests.map((request) => {
          const isBusy = busyId === request.id;
          const inviteUrl = request.invite_token ? buildInviteUrl(request.invite_token) : null;

          return (
            <article
              key={request.id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">{request.name}</h2>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${badgeClasses(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Requested{" "}
                    {new Date(request.created_at).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{request.company}</p>
                  <p>{request.role}</p>
                </div>
              </div>

              <dl className="mt-5 grid gap-4 text-sm text-gray-600 md:grid-cols-2">
                <div>
                  <dt className="font-medium text-gray-900">Work email</dt>
                  <dd className="mt-1 break-all">{request.email}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Source</dt>
                  <dd className="mt-1 font-mono text-xs">{request.source_path}</dd>
                </div>
              </dl>

              {request.status === "invited" && request.invite_token && inviteUrl && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Invite link ready
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-emerald-950">
                    {inviteUrl}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => copyInviteLink(request)}
                      className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                    >
                      Copy invite link
                    </button>
                    <button
                      type="button"
                      onClick={() => openDraftEmail(request)}
                      className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      Draft email
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        runAction(request, "approve", { regenerateInviteToken: true })
                      }
                      className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Regenerate link
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-900">
                  Review notes
                </label>
                <textarea
                  rows={3}
                  value={notesById[request.id] ?? ""}
                  onChange={(event) =>
                    setNotesById((current) => ({
                      ...current,
                      [request.id]: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Add internal notes about fit, follow-up, or next step."
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => runAction(request, "save")}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save notes
                </button>

                {request.status !== "invited" && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => runAction(request, "approve")}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Approve and issue invite
                  </button>
                )}

                {request.status === "new" && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => runAction(request, "review")}
                    className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Mark reviewed
                  </button>
                )}

                {request.status !== "rejected" && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => runAction(request, "reject")}
                    className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject
                  </button>
                )}

                {request.status !== "new" && request.status !== "invited" && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => runAction(request, "reopen")}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
