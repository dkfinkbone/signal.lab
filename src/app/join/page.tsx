import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Request Access - Signal.lab",
  description:
    "Request access to the Signal.lab pilot. Self-serve onboarding is not live yet.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function JoinPage() {
  return (
    <section className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
        Invite-only pilot
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
        Request access to Signal.lab
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Self-serve onboarding is still being built. For now, access to the full
        project brief and contributor workflow is handled through invite links and
        direct outreach.
      </p>
      <div className="mt-8 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm text-gray-700">
          If you already have an invite token, append it to the project URL:
        </p>
        <code className="block rounded-lg bg-white px-4 py-3 text-sm text-gray-800">
          /project?token=your-invite-token
        </code>
        <p className="text-sm text-gray-700">
          If you do not have one yet, use the public pages below while the request
          workflow is finalized.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/about"
          className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Read About
        </Link>
        <Link
          href="/project"
          className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View Project Gate
        </Link>
      </div>
    </section>
  );
}
