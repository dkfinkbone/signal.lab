import { NextResponse } from "next/server";
import { getVerifiedMemberBySlug } from "@/lib/member-graph";
import { personJsonLd } from "@/lib/json-ld";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const member = await getVerifiedMemberBySlug(slug);

  if (!member) {
    return NextResponse.json({ error: "Contributor not found" }, { status: 404 });
  }

  const payload = personJsonLd(member);

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Last-Modified": new Date(member.updated_at).toUTCString(),
    },
  });
}
