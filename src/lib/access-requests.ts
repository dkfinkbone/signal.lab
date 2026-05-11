import { randomBytes } from "node:crypto";
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

export const ACCESS_REQUEST_REVIEW_ACTIONS = [
  "save",
  "review",
  "approve",
  "reject",
  "reopen",
] as const;

export type AccessRequestReviewAction =
  (typeof ACCESS_REQUEST_REVIEW_ACTIONS)[number];

export interface AccessRequestReviewInput {
  action: AccessRequestReviewAction;
  notes: string;
  regenerateInviteToken: boolean;
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

export function generateInviteToken(): string {
  return randomBytes(16).toString("hex");
}

export function parseAccessRequestReviewPayload(
  payload: unknown
): AccessRequestReviewInput {
  const record = requireObject(payload, "Invalid access-request update.");
  const action = getStringField(record, "action") as AccessRequestReviewAction;
  const notes = getStringField(record, "notes");
  const regenerateInviteToken = Boolean(record.regenerateInviteToken);

  if (!ACCESS_REQUEST_REVIEW_ACTIONS.includes(action)) {
    throw new Error("Choose a valid review action.");
  }

  return {
    action,
    notes,
    regenerateInviteToken,
  };
}

export function buildAccessRequestUpdate(
  current: AccessRequest,
  input: AccessRequestReviewInput,
  now = new Date().toISOString()
): {
  status: AccessRequest["status"];
  notes: string;
  invite_token: string | null;
  updated_at: string;
} {
  let status = current.status;
  let inviteToken = current.invite_token ?? null;

  switch (input.action) {
    case "save":
      break;
    case "review":
      status = "reviewed";
      break;
    case "approve":
      status = "invited";
      if (!inviteToken || input.regenerateInviteToken) {
        inviteToken = generateInviteToken();
      }
      break;
    case "reject":
      status = "rejected";
      break;
    case "reopen":
      status = "new";
      break;
  }

  return {
    status,
    notes: input.notes,
    invite_token: inviteToken,
    updated_at: now,
  };
}

export async function listAccessRequestsAdmin(): Promise<AccessRequest[]> {
  const { getServiceClient } = await import("@/lib/supabase-service");
  const client = getServiceClient();
  const { data, error } = await client
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to load access requests.");
  }

  return data as AccessRequest[];
}

export async function getAccessRequestById(id: string): Promise<AccessRequest | null> {
  const { getServiceClient } = await import("@/lib/supabase-service");
  const client = getServiceClient();
  const { data, error } = await client
    .from("access_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as AccessRequest | null) ?? null;
}

export async function getIssuedAccessRequestByInviteToken(
  token: string | null | undefined
): Promise<AccessRequest | null> {
  const normalized = token?.trim();
  if (!normalized) return null;

  const { getServiceClient } = await import("@/lib/supabase-service");
  const client = getServiceClient();
  const { data, error } = await client
    .from("access_requests")
    .select("*")
    .eq("invite_token", normalized)
    .eq("status", "invited")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as AccessRequest | null) ?? null;
}

export async function updateAccessRequestReview(
  id: string,
  input: AccessRequestReviewInput
): Promise<AccessRequest> {
  const { getServiceClient } = await import("@/lib/supabase-service");
  const client = getServiceClient();
  const current = await getAccessRequestById(id);

  if (!current) {
    throw new Error("Access request not found.");
  }

  const update = buildAccessRequestUpdate(current, input);
  const { data, error } = await client
    .from("access_requests")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to update the access request.");
  }

  return data as AccessRequest;
}
