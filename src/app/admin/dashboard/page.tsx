import { getServiceClient } from "@/lib/supabase-service";
import type { RequestEvent } from "@/types";

export const dynamic = "force-dynamic";

interface BotRow { bot_family: string; count: number }
interface RouteRow { route_type: string; count: number }
interface SlugRow { slug: string; count: number }

export default async function AttributionDashboard() {
  const client = getServiceClient();

  const [latestRes, botRes, routeRes, slugRes] = await Promise.all([
    // Latest 100 events
    client
      .from("request_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),

    // By bot family
    client.rpc("attribution_by_bot_family"),

    // By route type
    client.rpc("attribution_by_route"),

    // By slug (top 20)
    client.rpc("attribution_by_slug"),
  ]);

  const events: RequestEvent[] = latestRes.data ?? [];

  // Fallback: compute from events array if RPCs not available yet
  const botCounts: Record<string, number> = {};
  const routeCounts: Record<string, number> = {};
  const slugCounts: Record<string, number> = {};

  for (const e of events) {
    if (e.bot_family) botCounts[e.bot_family] = (botCounts[e.bot_family] ?? 0) + 1;
    if (e.route_type) routeCounts[e.route_type] = (routeCounts[e.route_type] ?? 0) + 1;
    if (e.slug) slugCounts[e.slug] = (slugCounts[e.slug] ?? 0) + 1;
  }

  const botRows: BotRow[] = (botRes.data as BotRow[] | null) ??
    Object.entries(botCounts).map(([bot_family, count]) => ({ bot_family, count }))
      .sort((a, b) => b.count - a.count);

  const routeRows: RouteRow[] = (routeRes.data as RouteRow[] | null) ??
    Object.entries(routeCounts).map(([route_type, count]) => ({ route_type, count }))
      .sort((a, b) => b.count - a.count);

  const slugRows: SlugRow[] = (slugRes.data as SlugRow[] | null) ??
    Object.entries(slugCounts).map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

  return (
    <>
      <h1 className="text-2xl font-bold mb-8">Attribution Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label="Events (shown)" value={events.length} />
        <StatCard label="Unique Bots" value={botRows.length} />
        <StatCard label="Unique Slugs" value={slugRows.length} />
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        {/* By bot family */}
        <section>
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">
            Requests by Bot Family
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Bot Family</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {botRows.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-400 text-xs">No data yet</td></tr>
                )}
                {botRows.map((row) => (
                  <tr key={row.bot_family} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{row.bot_family}</td>
                    <td className="px-4 py-2 text-right font-mono">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* By route type */}
        <section>
          <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">
            Requests by Route
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Route Type</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routeRows.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-400 text-xs">No data yet</td></tr>
                )}
                {routeRows.map((row) => (
                  <tr key={row.route_type} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{row.route_type}</td>
                    <td className="px-4 py-2 text-right font-mono">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* By slug */}
      <section className="mb-10">
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">
          Requests by Slug (top 20)
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Slug</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slugRows.length === 0 && (
                <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-400 text-xs">No data yet</td></tr>
              )}
              {slugRows.map((row) => (
                <tr key={row.slug} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">
                    <a href={`/insights/${row.slug}`} className="hover:text-blue-600" target="_blank">
                      {row.slug}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Latest 100 events */}
      <section>
        <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">
          Latest 100 Request Events
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Time</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Route</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Path</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Bot</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
                    No events logged yet. Visit a public route to generate events.
                  </td>
                </tr>
              )}
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString("en-GB", { timeStyle: "short", dateStyle: "short" })}
                  </td>
                  <td className="px-3 py-2 font-mono text-gray-600">{e.route_type}</td>
                  <td className="px-3 py-2 font-mono text-gray-700 max-w-xs truncate">{e.path}</td>
                  <td className="px-3 py-2">
                    {e.bot_family && e.bot_family !== "unknown" ? (
                      <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs">
                        {e.bot_family}
                      </span>
                    ) : (
                      <span className="text-gray-400">human</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-500">{e.status_code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
