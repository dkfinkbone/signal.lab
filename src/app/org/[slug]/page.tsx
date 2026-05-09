import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { organizationJsonLd } from "@/lib/json-ld";
import { getCategoryLabel, getCategoryRouteParam } from "@/lib/categories";
import {
  asJsonObject,
  asStringArray,
  getVerifiedMembersForOrg,
  getVerifiedOrgBySlug,
} from "@/lib/member-graph";
import { pageMetadata } from "@/lib/metadata";
import { logRequestEventFromHeaders } from "@/lib/log-event";

interface Props {
  params: Promise<{ slug: string }>;
}

function collectOrgCategories(members: Awaited<ReturnType<typeof getVerifiedMembersForOrg>>) {
  const categories = new Set<string>();

  for (const member of members) {
    const json = asJsonObject(member.profile_json);
    const expertise = asJsonObject(json?.expertise);
    for (const category of asStringArray(expertise?.categories)) {
      categories.add(category);
    }
  }

  return [...categories].sort();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const org = await getVerifiedOrgBySlug(slug);

  if (!org) {
    return { title: "Not Found" };
  }

  return pageMetadata(
    `${org.name} | Signal.lab`,
    `Verified contributor cluster for ${org.name} on Signal.lab.`,
    `/org/${slug}`
  );
}

export default async function OrgPage({ params }: Props) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const org = await getVerifiedOrgBySlug(slug);

  if (!org) {
    await logRequestEventFromHeaders({
      headers: requestHeaders,
      path: `/org/${slug}`,
      routeType: "org",
      slug,
      statusCode: 404,
    });
    notFound();
  }

  const members = await getVerifiedMembersForOrg(org.id);

  await logRequestEventFromHeaders({
    headers: requestHeaders,
    path: `/org/${slug}`,
    routeType: "org",
    slug,
    statusCode: 200,
  });

  const categories = collectOrgCategories(members);
  const jsonLd = organizationJsonLd(org, members);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl">
        <header className="border-b border-gray-100 pb-8 mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
            Organisation cluster
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            {org.name}
          </h1>
          {org.org_domain && (
            <p className="mt-3 text-lg text-gray-600">{org.org_domain}</p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            Machine-readable profile:{" "}
            <a href={`/org/${slug}/data.json`} className="hover:text-blue-600">
              /org/{slug}/data.json
            </a>
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
            Members
          </h2>
          {members.length > 0 ? (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {members.map((member) => (
                <li key={member.id} className="rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  {(member.role || member.company) && (
                    <p className="mt-2 text-sm text-gray-600">
                      {[member.role, member.company].filter(Boolean).join(" at ")}
                    </p>
                  )}
                  {member.profile_slug && (
                    <Link
                      href={`/p/${member.profile_slug}`}
                      className="mt-4 inline-block text-sm text-blue-600 hover:underline"
                    >
                      View profile
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No verified members are currently published in this cluster.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">
            Shared domains
          </h2>
          {categories.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/c/${encodeURIComponent(getCategoryRouteParam(category))}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {getCategoryLabel(category)}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Shared expertise categories will appear as members contribute.
            </p>
          )}
        </section>
      </article>
    </>
  );
}
