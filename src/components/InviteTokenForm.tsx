"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface InviteTokenFormProps {
  primaryTarget: "join" | "project";
  showSecondaryTarget?: boolean;
  inputLabel?: string;
  helperText?: string;
  className?: string;
  tone?: "light" | "dark";
}

function pathForTarget(target: "join" | "project", token: string) {
  const encoded = encodeURIComponent(token.trim());
  return target === "project" ? `/project?token=${encoded}` : `/join/${encoded}`;
}

function buttonLabel(target: "join" | "project") {
  return target === "project" ? "Open project brief" : "Continue with token";
}

export default function InviteTokenForm({
  primaryTarget,
  showSecondaryTarget = false,
  inputLabel = "Invite token",
  helperText,
  className,
  tone = "light",
}: InviteTokenFormProps) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  function navigate(target: "join" | "project") {
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Enter your invite token to continue.");
      return;
    }

    setError(null);
    router.push(pathForTarget(target, trimmed));
  }

  const secondaryTarget = primaryTarget === "project" ? "join" : "project";
  const isDark = tone === "dark";

  return (
    <div className={className}>
      <label className="block">
        <span
          className={`mb-2 block text-sm font-medium ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {inputLabel}
        </span>
        <input
          type="text"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            isDark
              ? "border-gray-700 bg-gray-950 text-gray-100 placeholder:text-gray-500"
              : "border-gray-300 text-gray-900"
          }`}
          placeholder="Paste your invite token"
        />
      </label>
      {helperText && (
        <p className={`mt-3 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {helperText}
        </p>
      )}
      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate(primaryTarget)}
          className={`inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            isDark
              ? "bg-[var(--accent)] text-[#0f0f0d] hover:opacity-90"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {buttonLabel(primaryTarget)}
        </button>
        {showSecondaryTarget && (
          <button
            type="button"
            onClick={() => navigate(secondaryTarget)}
            className={`inline-flex items-center rounded-2xl border px-5 py-3 text-sm font-medium transition ${
              isDark
                ? "border-gray-700 text-gray-200 hover:bg-white/5"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {buttonLabel(secondaryTarget)}
          </button>
        )}
      </div>
    </div>
  );
}
