import {
  buildAccessRequestUpdate,
  generateInviteToken,
  parseAccessRequestReviewPayload,
} from "@/lib/access-requests";
import type { AccessRequest } from "@/types";

const baseRequest: AccessRequest = {
  id: "request-1",
  created_at: "2026-05-11T15:18:31.522Z",
  updated_at: "2026-05-11T15:18:31.522Z",
  name: "Duncan Hart",
  email: "duncan.hart@colortokens.com",
  company: "Colortokens",
  role: "RSM",
  source_path: "/join",
  invite_token: null,
  status: "new",
  notes: "",
};

describe("access-request review helpers", () => {
  it("generates a hex invite token", () => {
    const token = generateInviteToken();
    expect(token).toMatch(/^[a-f0-9]{32}$/);
  });

  it("parses valid review input", () => {
    expect(
      parseAccessRequestReviewPayload({
        action: "approve",
        notes: "Looks like a good fit.",
        regenerateInviteToken: true,
      })
    ).toEqual({
      action: "approve",
      notes: "Looks like a good fit.",
      regenerateInviteToken: true,
    });
  });

  it("rejects unknown review actions", () => {
    expect(() =>
      parseAccessRequestReviewPayload({
        action: "ship-it",
      })
    ).toThrow("Choose a valid review action.");
  });

  it("approving generates an invite token and marks the request invited", () => {
    const update = buildAccessRequestUpdate(
      baseRequest,
      {
        action: "approve",
        notes: "Approved for pilot.",
        regenerateInviteToken: false,
      },
      "2026-05-11T16:00:00.000Z"
    );

    expect(update.status).toBe("invited");
    expect(update.invite_token).toMatch(/^[a-f0-9]{32}$/);
    expect(update.notes).toBe("Approved for pilot.");
    expect(update.updated_at).toBe("2026-05-11T16:00:00.000Z");
  });

  it("approve keeps the existing invite token unless regeneration is requested", () => {
    const existingToken = "0123456789abcdef0123456789abcdef";
    const update = buildAccessRequestUpdate(
      {
        ...baseRequest,
        status: "invited",
        invite_token: existingToken,
      },
      {
        action: "approve",
        notes: "Re-approved.",
        regenerateInviteToken: false,
      }
    );

    expect(update.status).toBe("invited");
    expect(update.invite_token).toBe(existingToken);
  });

  it("review and reject update statuses without forcing a new token", () => {
    const reviewed = buildAccessRequestUpdate(baseRequest, {
      action: "review",
      notes: "Need to verify role.",
      regenerateInviteToken: false,
    });
    const rejected = buildAccessRequestUpdate(baseRequest, {
      action: "reject",
      notes: "Outside current pilot scope.",
      regenerateInviteToken: false,
    });

    expect(reviewed.status).toBe("reviewed");
    expect(reviewed.invite_token).toBeNull();
    expect(rejected.status).toBe("rejected");
    expect(rejected.invite_token).toBeNull();
  });

  it("reopen resets the request back to new", () => {
    const existingToken = "fedcba9876543210fedcba9876543210";
    const reopened = buildAccessRequestUpdate(
      {
        ...baseRequest,
        status: "rejected",
        invite_token: existingToken,
      },
      {
        action: "reopen",
        notes: "Second look after referral.",
        regenerateInviteToken: false,
      }
    );

    expect(reopened.status).toBe("new");
    expect(reopened.invite_token).toBe(existingToken);
  });
});
