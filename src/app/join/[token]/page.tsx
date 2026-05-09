import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isInviteTokenAccepted } from "@/lib/invite-tokens";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import { pageMetadata } from "@/lib/metadata";

interface JoinLandingPageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: JoinLandingPageProps): Promise<Metadata> {
  const { token } = await params;

  return {
    ...pageMetadata(
      "Join Signal.lab",
      "Accept your Signal.lab invite and continue with a verified work email.",
      `/join/${token}`
    ),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function JoinLandingPage({ params }: JoinLandingPageProps) {
  const { token } = await params;
  const inviteToken = decodeURIComponent(token);

  if (!isInviteTokenAccepted(inviteToken, { allowAnyWhenUnconfigured: true })) {
    redirect("/join?invite=invalid");
  }

  await logRequestEventFromHeaders({
    headers: await headers(),
    path: `/join/${inviteToken}`,
    routeType: "join_landing",
    slug: inviteToken,
    statusCode: 200,
  });

  return (
    <section className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
        Verified invitation
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
        You&apos;ve been invited into the Signal.lab network
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Signal.lab is building a trusted, agent-readable graph of channel expertise.
        The next step is simple: verify your work identity, then publish your first
        structured contribution.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          {
            step: "01",
            title: "Verify identity",
            body: "Use a work email so the network can attribute your expertise to a real company and role.",
          },
          {
            step: "02",
            title: "Add contribution data",
            body: "Share account coverage and your strongest domains so your profile has real signal from day one.",
          },
          {
            step: "03",
            title: "Publish your node",
            body: "Signal.lab turns that contribution into a linked public profile and machine-readable knowledge endpoint.",
          },
        ].map((card) => (
          <div key={card.step} className="rounded-3xl border border-gray-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              {card.step}
            </p>
            <h2 className="mt-3 text-lg font-semibold text-gray-900">{card.title}</h2>
            <p className="mt-3 text-sm text-gray-600">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href={`/join/${encodeURIComponent(inviteToken)}/signup`}
          className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Continue with work email
        </Link>
        <Link
          href="/about"
          className="inline-flex items-center rounded-2xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Read the public overview
        </Link>
      </div>
    </section>
  );
}
