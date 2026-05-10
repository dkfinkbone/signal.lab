"use client";

import { useState } from "react";
import { inferCompanyNameFromEmail } from "@/lib/onboarding";

interface AccessRequestFormProps {
  sourcePath: string;
}

export default function AccessRequestForm({ sourcePath }: AccessRequestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [companyTouched, setCompanyTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const companyValue = companyTouched ? company : inferCompanyNameFromEmail(email);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/access-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          company: companyValue,
          role,
          sourcePath,
        }),
      });

      const payload = (await response.json()) as { error?: string; email?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to submit the access request.");
        return;
      }

      setSubmittedEmail(payload.email ?? email);
    } catch {
      setError("Unable to submit the access request right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Request recorded
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-gray-900">
          Access request saved for {submittedEmail}
        </h2>
        <p className="mt-3 text-sm text-gray-700">
          Your request is now stored in Signal.lab. A network admin can review it and
          issue an invite token from there.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Full name</span>
          <input
            required
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Jane Smith"
          />
        </label>

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
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Company</span>
          <input
            required
            type="text"
            value={companyValue}
            onChange={(event) => {
              setCompanyTouched(true);
              setCompany(event.target.value);
            }}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Acme Security"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Current role</span>
          <input
            required
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Channel Account Manager"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        Use your work email. Access requests are stored for admin review so an invite
        token can be issued later.
      </div>

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
        {isSubmitting ? "Submitting request..." : "Request access"}
      </button>
    </form>
  );
}
