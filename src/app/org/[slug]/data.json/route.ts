import { NextResponse } from "next/server";
import { organizationJsonLd } from "@/lib/json-ld";
import { getVerifiedMembersForOrg, getVerifiedOrgBySlug } from "@/lib/member-graph";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const org = await getVerifiedOrgBySlug(slug);

  if (!org) {
    return NextResponse.json({ error: "Organisation not found" }, { status: 404 });
  }

  const members = await getVerifiedMembersForOrg(org.id);
  const payload = organizationJsonLd(org, members);

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Last-Modified": new Date(org.updated_at).toUTCString(),
    },
  });
}
