export type ForgeStatus = "PASSED" | "REJECTED" | "UNKNOWN";

export type ForgeItem = {
  id: string;
  domain: string;
  title: string;
  slug: string;
  status: ForgeStatus;
  level: string;
  category: string;
  subtitle?: string | null;
  tags: string[];
  updated?: number | null;
  year?: number | null;
  country?: string | null;
  creator?: string | null;
  sourcePath: string;
  url: string;
  heat: number;
  edges?: Array<{ to: string; weight: number; sharedTags: string[] }>;
};

export type ForgeIndex = {
  generated_at: string;
  count: number;
  items: ForgeItem[];
};

export type StatsIndex = {
  generated_at: string;
  totals: { all: number; passed: number; rejected: number };
  by_domain: Record<string, number>;
  by_status: Record<string, number>;
  by_level: Record<string, number>;
  top_categories: Array<[string, number]>;
  top_tags: Array<[string, number]>;
};
