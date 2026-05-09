import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCategoryLabel } from "@/lib/categories";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";
import { getAuthenticatedUser } from "@/lib/supabase-auth-server";
import { getOnboardingContextByEmail } from "@/lib/onboarding-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...pageMetadata(
    "Signal.lab onboarding - Profile",
    "Review the profile foundation created from your first contribution.",
    "/onboarding/profile"
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OnboardingProfilePage() {
  const user = await getAuthenticatedUser();
  if (!user?.email) {
    redirect("/join");
  }

  const context = await getOnboardingContextByEmail(user.email);
  if (!context.member) {
    redirect("/join?error=schema_pending");
  }

  await logRequestEventFromHeaders({
    headers: await headers(),
    path: "/onboarding/profile",
    routeType: "onboarding",
    statusCode: 200,
  });

  const profileLink = context.member.profile_slug
    ? `/p/${context.member.profile_slug}`
    : null;
  const orgLink = context.org ? `/org/${context.org.org_slug}` : null;

  return (
    <section className="max-w-4xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
        Profile foundation live
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
        {context.member.name}, your Signal.lab node is seeded
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        The structured data is now attached to your verified identity and ready for the
        public profile layer.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            Profile score
          </p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">
            {context.member.profile_score ?? 0}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            Account patterns
          </p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">
            {context.accounts.length}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            Domains
          </p>
          <p className="mt-3 text-3xl font-semibold text-gray-900">
            {context.domains.length}
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900">What&apos;s linked now</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {context.domains.map((domain) => (
            <Link
              key={domain}
              href={`/c/${encodeURIComponent(domain)}`}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {getCategoryLabel(domain)}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900">Organisation signal</h2>
        {context.org && context.colleagues.length > 0 ? (
          <>
            <p className="mt-3 text-sm text-gray-600">
              {context.colleagues.length} colleagues from {context.org.name} are already on
              the network.
            </p>
            <ul className="mt-4 space-y-3">
              {context.colleagues.map((colleague) => (
                <li key={colleague.id} className="text-sm text-gray-700">
                  {colleague.name}
                  {colleague.role ? ` — ${colleague.role}` : ""}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 text-sm text-gray-600">
            You are the first visible member from {context.member.company}. Invite
            colleagues to turn this into a real org cluster.
          </p>
        )}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        {profileLink && (
          <Link
            href={profileLink}
            className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            View public profile
          </Link>
        )}
        {orgLink && (
          <Link
            href={orgLink}
            className="inline-flex items-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            View org cluster
          </Link>
        )}
        <Link
          href="/insights"
          className="inline-flex items-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Browse insights
        </Link>
      </div>
    </section>
  );
}
