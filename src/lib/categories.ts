export interface CategoryDefinition {
  slug: string;
  label: string;
}

export const NETWORK_CATEGORIES: CategoryDefinition[] = [
  { slug: "microsegmentation", label: "Zero Trust Microsegmentation" },
  { slug: "zero-trust", label: "Zero Trust Architecture" },
  { slug: "sase-sd-wan", label: "SASE / SD-WAN" },
  { slug: "cloud-security", label: "Cloud Security" },
  { slug: "edr-endpoint", label: "EDR / Endpoint Security" },
  { slug: "firewalls-network", label: "Firewalls / Network Security" },
  { slug: "ot-ics", label: "OT / ICS Security" },
  { slug: "iam", label: "Identity & Access Management" },
  { slug: "siem-soc", label: "SIEM / SOC / Threat Intelligence" },
  { slug: "data-security", label: "Data Security / DLP" },
  { slug: "grc-compliance", label: "GRC / Compliance" },
  { slug: "managed-services", label: "Managed Services / MSSP" },
  { slug: "cloud-infra", label: "Cloud Infrastructure" },
  { slug: "ucc", label: "UC&C / Collaboration" },
];

function normalizeCategoryValue(value: string): string {
  return decodeURIComponent(value).trim();
}

const CATEGORY_LOOKUP = new Map<string, CategoryDefinition>();

for (const category of NETWORK_CATEGORIES) {
  CATEGORY_LOOKUP.set(category.slug.toLowerCase(), category);
  CATEGORY_LOOKUP.set(category.label.toLowerCase(), category);
}

export function getCategoryDefinition(value: string): CategoryDefinition | null {
  return CATEGORY_LOOKUP.get(normalizeCategoryValue(value).toLowerCase()) ?? null;
}

export function getCategoryRouteParam(value: string): string {
  return getCategoryDefinition(value)?.slug ?? normalizeCategoryValue(value);
}

export function getCategoryLabel(value: string): string {
  return getCategoryDefinition(value)?.label ?? normalizeCategoryValue(value);
}

export function collectCategoryRouteParams(liveCategories: string[]): string[] {
  const params = new Set<string>(NETWORK_CATEGORIES.map((category) => category.slug));

  for (const category of liveCategories) {
    const normalized = getCategoryRouteParam(category);
    if (normalized) {
      params.add(normalized);
    }
  }

  return [...params];
}
