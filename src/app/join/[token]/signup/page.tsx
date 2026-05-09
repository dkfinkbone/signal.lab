import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import JoinSignupForm from "@/components/JoinSignupForm";
import { isInviteTokenAccepted } from "@/lib/invite-tokens";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";

interface JoinSignupPageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: JoinSignupPageProps): Promise<Metadata> {
  const { token } = await params;

  return {
    ...pageMetadata(
      "Join Signal.lab - Verify your work email",
      "Complete the Signal.lab invite flow with your work email and role.",
      `/join/${token}/signup`
    ),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function JoinSignupPage({ params }: JoinSignupPageProps) {
  const { token } = await params;
  const inviteToken = decodeURIComponent(token);

  if (!isInviteTokenAccepted(inviteToken, { allowAnyWhenUnconfigured: true })) {
    redirect("/join?invite=invalid");
  }

  await logRequestEventFromHeaders({
    headers: await headers(),
    path: `/join/${inviteToken}/signup`,
    routeType: "join_signup",
    slug: inviteToken,
    statusCode: 200,
  });

  return (
    <section className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
        Work email verification
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
        Start your Signal.lab profile
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Enter the identity details that should sit behind your public knowledge node.
        The magic link email completes verification and keeps passwords out of the flow.
      </p>

      <div className="mt-8 rounded-3xl border border-gray-200 p-6">
        <JoinSignupForm inviteToken={inviteToken} />
      </div>
    </section>
  );
}
