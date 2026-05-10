import type { Metadata } from "next";
import AccountSignInForm from "@/components/AccountSignInForm";
import AccessRequestForm from "@/components/AccessRequestForm";
import InviteTokenForm from "@/components/InviteTokenForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Request Access - Signal.lab",
  description:
    "Request access to the Signal.lab pilot or recover from an invalid invite link.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; error?: string }>;
}) {
  const params = await searchParams;
  const inviteState = params.invite ?? null;
  const error = params.error ?? null;

  return (
    <section className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
        Invite-only pilot
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
        Request access to Signal.lab
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Signal.lab onboarding now starts from an invite link. If your link has
        expired, is invalid, or you do not have one yet, this page is the fallback.
      </p>
      {(inviteState || error) && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {inviteState === "invalid" && (
            <p>The invite link could not be validated. Ask the inviter for a fresh link.</p>
          )}
          {error === "verify_failed" && (
            <p>
              The email verification link could not be completed. Request another magic
              link from your invite page and try again.
            </p>
          )}
          {error === "schema_pending" && (
            <p>
              The onboarding database tables are not live in Supabase yet. The app code
              is ready, but the schema still needs to be applied before signup can finish.
            </p>
          )}
        </div>
      )}
      <div className="mt-8 rounded-3xl border border-gray-200 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
          Already have a token?
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
          Enter it here instead of editing the URL
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          Use the same token to continue to the invite flow or open the gated project
          brief directly.
        </p>
        <div className="mt-6">
          <InviteTokenForm
            primaryTarget="join"
            showSecondaryTarget
            helperText="Primary action continues the onboarding flow. The secondary action opens the project brief gate with the same token."
          />
        </div>
      </div>
      <div className="mt-8 rounded-3xl border border-gray-200 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
          No token yet?
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
          Request access
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          Submit your work details and Signal.lab will record the request for admin
          review.
        </p>
        <div className="mt-6">
          <AccessRequestForm sourcePath="/join" />
        </div>
      </div>
      <div className="mt-8 rounded-3xl border border-gray-200 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
          Already a member?
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
          Send yourself a new sign-in link
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          If your profile already exists, you do not need to re-enter the invite flow.
          Use your work email to jump straight back into your member workspace.
        </p>
        <div className="mt-6">
          <AccountSignInForm sourceLabel="your member workspace" />
        </div>
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
        <Link
          href="/me"
          className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          My Signal.lab
        </Link>
      </div>
    </section>
  );
}
