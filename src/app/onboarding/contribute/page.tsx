import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingContributionForm from "@/components/OnboardingContributionForm";
import { getAuthenticatedUser } from "@/lib/supabase-auth-server";
import { getOnboardingContextByEmail } from "@/lib/onboarding-store";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...pageMetadata(
    "Signal.lab onboarding - Contribution",
    "Add your account coverage and strongest technology domains.",
    "/onboarding/contribute"
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OnboardingContributionPage() {
  const user = await getAuthenticatedUser();
  if (!user?.email) {
    redirect("/join");
  }

  const context = await getOnboardingContextByEmail(user.email);
  if (!context.member) {
    redirect("/join?error=schema_pending");
  }

  const hasExistingContributionData =
    context.accounts.length > 0 || context.domains.length > 0;

  await logRequestEventFromHeaders({
    headers: await headers(),
    path: "/onboarding/contribute",
    routeType: "onboarding",
    statusCode: 200,
  });

  return (
    <section className="max-w-4xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
        Onboarding
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
        {hasExistingContributionData ? "Update your expertise profile" : "Add your first contribution"}
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        {hasExistingContributionData
          ? "Refresh the account patterns and domain coverage behind your public profile."
          : "This is the structured data that powers your public profile, category links, and future org cluster."}
      </p>

      <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
        Signed in as <strong className="text-gray-900">{context.member.email}</strong> at{" "}
        <strong className="text-gray-900">{context.member.company}</strong>.
      </div>

      <div className="mt-8 rounded-3xl border border-gray-200 p-6">
        <OnboardingContributionForm
          initialAccounts={context.accounts}
          initialDomains={context.domains}
          submitLabel={hasExistingContributionData ? "Save expertise changes" : "Continue to profile"}
        />
      </div>
    </section>
  );
}
