import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { logRequestEventFromHeaders } from "@/lib/log-event";
import {
  asJsonObject,
  asString,
  asStringArray,
  getVerifiedMemberBySlug,
} from "@/lib/member-graph";
import { personJsonLd } from "@/lib/json-ld";
import {
  getCategoryLabel,
  getCategoryRouteParam,
} from "@/lib/categories";
import { pageMetadata } from "@/lib/metadata";
import { orgPath, profileCanonical } from "@/lib/canonical";

interface Props {
  params: Promise<{ slug: string }>;
}

function getProfileSnapshot(profileJson: unknown) {
  const json = asJsonObject(profileJson);
  const expertise = asJsonObject(json?.expertise);
  const orgNetwork = asJsonObject(json?.org_network);

  return {
    sameAs: asStringArray(json?.sameAs),
    categories: asStringArray(expertise?.categories),
    vendors: asStringArray(expertise?.vendors),
    orgPage: asString(orgNetwork?.org_page),
    insights: asStringArray(json?.insights),
    note: asString(json?.note),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = await getVerifiedMemberBySlug(slug);

  if (!member) {
    return { title: "Not Found" };
  }

  const description =
    [member.role, member.company].filter(Boolean).join(" at ") ||
    "Verified contributor profile on Signal.lab.";

  return pageMetadata(`${member.name} | Signal.lab`, description, `/p/${slug}`);
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const member = await getVerifiedMemberBySlug(slug);
  const requestHeaders = await headers();

  if (!member) {
    await logRequestEventFromHeaders({
      headers: requestHeaders,
      path: `/p/${slug}`,
      routeType: "profile",
      slug,
      statusCode: 404,
    });
    notFound();
  }

  await logRequestEventFromHeaders({
    headers: requestHeaders,
    path: `/p/${slug}`,
    routeType: "profile",
    slug,
    statusCode: 200,
  });

  const snapshot = getProfileSnapshot(member.profile_json);
  const jsonLd = personJsonLd(member);
  const canonical = profileCanonical(member.profile_slug ?? slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl">
        <header className="border-b border-gray-100 pb-8 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
            Verified contributor
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            {member.name}
          </h1>
          {(member.role || member.company) && (
            <p className="mt-3 text-lg text-gray-600">
              {[member.role, member.company].filter(Boolean).join(" at ")}
            </p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            Machine-readable profile:{" "}
            <a href={`/p/${slug}/data.json`} className="hover:text-blue-600">
              /p/{slug}/data.json
            </a>
          </p>
        </header>

        {snapshot.note && (
          <section className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
            {snapshot.note}
          </section>
        )}

        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
              Expertise
            </h2>
            {snapshot.categories.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {snapshot.categories.map((category) => {
                  const routeParam = getCategoryRouteParam(category);
                  return (
                    <Link
                      key={category}
                      href={`/c/${encodeURIComponent(routeParam)}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {getCategoryLabel(category)}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                Expertise categories will appear here once contribution data is available.
              </p>
            )}

            {snapshot.vendors.length > 0 && (
              <>
                <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
                  Vendor knowledge
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {snapshot.vendors.map((vendor) => (
                    <span
                      key={vendor}
                      className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600"
                    >
                      {vendor}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
              Network links
            </h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              {snapshot.orgPage && (
                <p>
                  Organisation cluster:{" "}
                  <a href={snapshot.orgPage} className="text-blue-600 hover:underline">
                    {snapshot.orgPage}
                  </a>
                </p>
              )}
              {member.org_id && !snapshot.orgPage && member.company && (
                <p>
                  Organisation route will resolve when the org cluster is published for{" "}
                  {member.company}.
                </p>
              )}
              {snapshot.sameAs.map((href) => (
                <p key={href}>
                  External profile:{" "}
                  <a href={href} className="text-blue-600 hover:underline">
                    {href}
                  </a>
                </p>
              ))}
              {!snapshot.orgPage && snapshot.sameAs.length === 0 && (
                <p>No external or organisation links are published yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
            Published insights
          </h2>
          {snapshot.insights.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {snapshot.insights.map((href) => (
                <li key={href}>
                  <a href={href} className="text-blue-600 hover:underline">
                    {href}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No attributed insights have been linked to this profile yet.
            </p>
          )}
        </section>

        <footer className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
          <p>
            Canonical:{" "}
            <a href={canonical} className="hover:underline">
              {canonical}
            </a>
          </p>
          {member.org_id && member.company && (
            <p className="mt-2">
              Org route template:{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
                {orgPath("[slug]")}
              </code>
            </p>
          )}
        </footer>
      </article>
    </>
  );
}
