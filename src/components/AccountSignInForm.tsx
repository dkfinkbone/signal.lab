"use client";

import { useState } from "react";

interface AccountSignInFormProps {
  sourceLabel?: string;
}

export default function AccountSignInForm({
  sourceLabel = "your Signal.lab profile",
}: AccountSignInFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/request-sign-in-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { error?: string; email?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to send the sign-in link.");
        return;
      }

      setSubmittedEmail(payload.email ?? email);
    } catch {
      setError("Unable to send the sign-in link right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Check your inbox
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-gray-900">
          Sign-in link sent to {submittedEmail}
        </h2>
        <p className="mt-3 text-sm text-gray-700">
          Open the latest email to get back into {sourceLabel}. The link will bring
          you straight into your member workspace.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">Work email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="jane@company.com"
        />
      </label>

      <p className="text-sm text-gray-600">
        Use the same work email you used when you first joined the network.
      </p>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending sign-in link..." : "Email me a sign-in link"}
      </button>
    </form>
  );
}
