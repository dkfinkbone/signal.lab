import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import AccountSignInForm from "@/components/AccountSignInForm";
import MemberProfileForm from "@/components/MemberProfileForm";
import SignOutButton from "@/components/SignOutButton";
import {
  ACCOUNT_REGION_OPTIONS,
  ACCOUNT_RELATIONSHIP_OPTIONS,
  ACCOUNT_SECTOR_OPTIONS,
  DEAL_BAND_OPTIONS,
} from "@/lib/onboarding";
import { getCategoryLabel } from "@/lib/categories";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";
import { getOnboardingContextByEmail } from "@/lib/onboarding-store";
import { getAuthenticatedUser } from "@/lib/supabase-auth-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...pageMetadata(
    "My Signal.lab account",
    "Manage your Signal.lab profile details and contribution data.",
    "/me"
  ),
  robots: {
    index: false,
    follow: false,
  },
};

const sectorLabels = new Map<string, string>(
  ACCOUNT_SECTOR_OPTIONS.map((option) => [option.value, option.label])
);
const regionLabels = new Map<string, string>(
  ACCOUNT_REGION_OPTIONS.map((option) => [option.value, option.label])
);
const relationshipLabels = new Map<string, string>(
  ACCOUNT_RELATIONSHIP_OPTIONS.map((option) => [option.value, option.label])
);
const dealBandLabels = new Map<string, string>(
  DEAL_BAND_OPTIONS.map((option) => [option.value, option.label])
);

export default async function MemberAccountPage() {
  await logRequestEventFromHeaders({
    headers: await headers(),
    path: "/me",
    routeType: "account",
    statusCode: 200,
  });

  const user = await getAuthenticatedUser();

  if (!user?.email) {
    return (
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Returning member
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
          Get back into your Signal.lab account
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          If you already have a verified Signal.lab profile, request a fresh
          magic link here instead of restarting the invite flow.
        </p>

        <div className="mt-8 rounded-3xl border border-gray-200 p-6">
          <AccountSignInForm sourceLabel="your Signal.lab account" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/join"
            className="inline-flex items-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Need an invite?
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Browse insights
          </Link>
        </div>
      </section>
    );
  }

  const context = await getOnboardingContextByEmail(user.email);

  if (!context.member) {
    return (
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
          Account mismatch
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
          This email is signed in, but no member node is linked yet
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Use an invite link to complete the first-run onboarding flow, then come back
          here to manage your public Signal.lab profile.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/join"
            className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Go to join flow
          </Link>
          <SignOutButton />
        </div>
      </section>
    );
  }

  const profileHref = context.member.profile_slug ? `/p/${context.member.profile_slug}` : null;
  const profileJsonHref = context.member.profile_slug
    ? `/p/${context.member.profile_slug}/data.json`
    : null;
  const orgHref = context.org ? `/org/${context.org.org_slug}` : null;

  return (
    <section className="max-w-5xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
        Member workspace
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
        Welcome back, {context.member.name}
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Update the identity details behind your public node, then jump back into your
        contribution data whenever your market coverage changes.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
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
        <div className="rounded-3xl border border-gray-200 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            Verified email
          </p>
          <p className="mt-3 text-sm font-medium text-gray-900">
            {context.member.email}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {profileHref && (
          <Link
            href={profileHref}
            className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            View public profile
          </Link>
        )}
        {profileJsonHref && (
          <Link
            href={profileJsonHref}
            className="inline-flex items-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            View JSON profile
          </Link>
        )}
        <Link
          href="/onboarding/contribute"
          className="inline-flex items-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Edit expertise
        </Link>
        {orgHref && (
          <Link
            href={orgHref}
            className="inline-flex items-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            View org cluster
          </Link>
        )}
        <SignOutButton />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-gray-200 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
            Profile basics
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">
            Edit your public attribution details
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            These fields shape the human-facing profile and the machine-readable JSON
            document attached to it.
          </p>

          <div className="mt-6">
            <MemberProfileForm
              initialValues={{
                name: context.member.name,
                company: context.member.company ?? "",
                role: context.member.role ?? "",
                linkedinUrl: context.member.linkedin_url ?? "",
                profileSlug: context.member.profile_slug ?? null,
              }}
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-gray-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              Domain signal
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">
              Current expertise tags
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {context.domains.length > 0 ? (
                context.domains.map((domain) => (
                  <span
                    key={domain}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700"
                  >
                    {getCategoryLabel(domain)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No domains saved yet. Add them from the expertise editor.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              Account coverage
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">
              Active account patterns
            </h2>
            {context.accounts.length > 0 ? (
              <ul className="mt-5 space-y-3 text-sm text-gray-600">
                {context.accounts.map((account, index) => (
                  <li key={`${account.sector}-${account.region}-${index}`} className="rounded-2xl bg-gray-50 px-4 py-3">
                    <span className="font-medium text-gray-900">
                      {sectorLabels.get(account.sector) ?? account.sector}
                    </span>{" "}
                    in {regionLabels.get(account.region) ?? account.region}
                    {" · "}
                    {relationshipLabels.get(account.relationship) ?? account.relationship}
                    {account.deal_band
                      ? ` · ${dealBandLabels.get(account.deal_band) ?? account.deal_band}`
                      : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                No account patterns saved yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
