"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACCOUNT_REGION_OPTIONS,
  ACCOUNT_RELATIONSHIP_OPTIONS,
  ACCOUNT_SECTOR_OPTIONS,
  DEAL_BAND_OPTIONS,
  DOMAIN_OPTIONS,
  calculateProfileScore,
} from "@/lib/onboarding";
import type { MemberAccount } from "@/types";

interface OnboardingContributionFormProps {
  initialAccounts: MemberAccount[];
  initialDomains: string[];
  submitLabel?: string;
}

function createEmptyAccount(): MemberAccount {
  return {
    sector: "",
    region: "",
    relationship: "",
    deal_band: null,
  };
}

export default function OnboardingContributionForm({
  initialAccounts,
  initialDomains,
  submitLabel = "Continue to profile",
}: OnboardingContributionFormProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<MemberAccount[]>(
    initialAccounts.length > 0 ? initialAccounts : [createEmptyAccount()]
  );
  const [domains, setDomains] = useState<string[]>(initialDomains);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeAccountCount = useMemo(
    () =>
      accounts.filter(
        (account) => account.sector && account.region && account.relationship
      ).length,
    [accounts]
  );
  const score = calculateProfileScore(completeAccountCount, domains.length);
  const canSubmit =
    completeAccountCount > 0 &&
    domains.length > 0 &&
    accounts.every((account) => account.sector && account.region && account.relationship);

  function updateAccount(
    index: number,
    field: keyof MemberAccount,
    value: string | null
  ) {
    setAccounts((current) =>
      current.map((account, accountIndex) =>
        accountIndex === index ? { ...account, [field]: value } : account
      )
    );
  }

  function addAccountRow() {
    setAccounts((current) =>
      current.length >= 10 ? current : [...current, createEmptyAccount()]
    );
  }

  function removeAccountRow(index: number) {
    setAccounts((current) =>
      current.length === 1
        ? current
        : current.filter((_, accountIndex) => accountIndex !== index)
    );
  }

  function toggleDomain(domain: string) {
    setDomains((current) =>
      current.includes(domain)
        ? current.filter((value) => value !== domain)
        : [...current, domain]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError("Add at least one complete account row and one domain to continue.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding/contribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accounts, domains }),
      });

      const payload = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to save your contribution.");
        return;
      }

      router.push(payload.redirectTo ?? "/onboarding/profile");
    } catch {
      setError("Unable to save your contribution right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              Section 1
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">Active accounts</h2>
            <p className="mt-2 text-sm text-gray-600">
              Add up to 10 account patterns. No company names are stored here.
            </p>
          </div>
          <button
            type="button"
            onClick={addAccountRow}
            disabled={accounts.length >= 10}
            className="inline-flex items-center rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add row
          </button>
        </div>

        <div className="space-y-4">
          {accounts.map((account, index) => (
            <div
              key={`${index}-${account.sector}-${account.region}-${account.relationship}`}
              className="rounded-3xl border border-gray-200 p-5"
            >
              <div className="grid gap-4 md:grid-cols-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Sector
                  </span>
                  <select
                    value={account.sector}
                    onChange={(event) => updateAccount(index, "sector", event.target.value)}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Choose sector</option>
                    {ACCOUNT_SECTOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Region
                  </span>
                  <select
                    value={account.region}
                    onChange={(event) => updateAccount(index, "region", event.target.value)}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Choose region</option>
                    {ACCOUNT_REGION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Relationship
                  </span>
                  <select
                    value={account.relationship}
                    onChange={(event) =>
                      updateAccount(index, "relationship", event.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Choose stage</option>
                    {ACCOUNT_RELATIONSHIP_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Deal band
                  </span>
                  <select
                    value={account.deal_band ?? ""}
                    onChange={(event) =>
                      updateAccount(index, "deal_band", event.target.value || null)
                    }
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Optional</option>
                    {DEAL_BAND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeAccountRow(index)}
                  disabled={accounts.length === 1}
                  className="text-sm font-medium text-gray-500 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove row
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
            Section 2
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">Domain knowledge</h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose the technology categories where you have the deepest deal-level
            knowledge.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {DOMAIN_OPTIONS.map((option) => {
            const active = domains.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleDomain(option.value)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
              Profile score
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Score = complete account rows × 4 + domains × 6, capped at 100.
            </p>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{score}</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gray-900 transition-[width]"
            style={{ width: `${score}%` }}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving your expertise..." : submitLabel}
      </button>
    </form>
  );
}
