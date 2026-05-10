import { inferCompanyNameFromEmail, isWorkEmail, normalizeEmail } from "@/lib/onboarding";
import type { AccessRequest } from "@/types";

function requireObject(value: unknown, errorMessage: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(errorMessage);
  }

  return value as Record<string, unknown>;
}

function getStringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

export interface AccessRequestInput {
  name: string;
  email: string;
  company: string;
  role: string;
  sourcePath: string;
  inviteToken: string | null;
}

export function parseAccessRequestPayload(payload: unknown): AccessRequestInput {
  const record = requireObject(payload, "Invalid access request.");
  const name = getStringField(record, "name");
  const email = normalizeEmail(getStringField(record, "email"));
  const role = getStringField(record, "role");
  const sourcePath = getStringField(record, "sourcePath") || "/join";
  const inviteToken = getStringField(record, "inviteToken") || null;
  const company =
    getStringField(record, "company") || inferCompanyNameFromEmail(email);

  if (name.length < 2) {
    throw new Error("Enter your full name.");
  }

  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  if (!isWorkEmail(email)) {
    throw new Error("Use your work email to request access.");
  }

  if (!role) {
    throw new Error("Add your current role.");
  }

  return {
    name,
    email,
    company,
    role,
    sourcePath,
    inviteToken,
  };
}

export async function upsertAccessRequest(
  input: AccessRequestInput
): Promise<AccessRequest> {
  const { getServiceClient } = await import("@/lib/supabase-service");
  const client = getServiceClient();
  const payload = {
    name: input.name,
    email: input.email,
    company: input.company,
    role: input.role,
    source_path: input.sourcePath,
    invite_token: input.inviteToken,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("access_requests")
    .upsert(payload, { onConflict: "email" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to record the access request.");
  }

  return data as AccessRequest;
}
