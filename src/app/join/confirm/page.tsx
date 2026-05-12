import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Continue to Signal.lab",
  description:
    "Confirm your email login in a normal browser before continuing into Signal.lab.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function JoinConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    code?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const tokenHash = params.token_hash ?? "";
  const code = params.code ?? "";
  const type = params.type ?? "email";
  const hasPayload = Boolean(tokenHash || code);

  return (
    <section className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
        Secure sign-in
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
        Continue to Signal.lab
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        To protect one-time sign-in links from email scanners and preview bots, we
        wait for a real browser click before completing verification.
      </p>

      <div className="mt-8 rounded-3xl border border-gray-200 p-6">
        {hasPayload ? (
          <>
            <p className="text-sm text-gray-600">
              Click below to complete your sign-in and continue to your Signal.lab
              workspace.
            </p>

            <form action="/join/verify" method="get" className="mt-6">
              {tokenHash ? (
                <input type="hidden" name="token_hash" value={tokenHash} />
              ) : null}
              {code ? <input type="hidden" name="code" value={code} /> : null}
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="confirm" value="1" />
              <button
                type="submit"
                className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Continue to Signal.lab
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              This sign-in link is missing the verification payload. Request a fresh
              email link and try again.
            </p>
            <div className="mt-6">
              <Link
                href="/join"
                className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Go back to join
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
