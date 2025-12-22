import fs from "node:fs/promises";
import path from "node:path";
import type { ForgeIndex, ForgeItem, StatsIndex } from "./types";

const root = process.cwd();

async function readJson<T>(relPath: string, fallback: T): Promise<T> {
  try {
    const full = path.join(root, relPath);
    const raw = await fs.readFile(full, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getForgeIndex(): Promise<ForgeIndex> {
  return readJson<ForgeIndex>("data/forge_index.json", {
    generated_at: new Date(0).toISOString(),
    count: 0,
    items: [],
  });
}

export async function getArchiveIndex(): Promise<ForgeIndex> {
  return readJson<ForgeIndex>("data/archive_index.json", {
    generated_at: new Date(0).toISOString(),
    count: 0,
    items: [],
  });
}

export async function getStats(): Promise<StatsIndex> {
  return readJson<StatsIndex>("data/stats.json", {
    generated_at: new Date(0).toISOString(),
    totals: { all: 0, passed: 0, rejected: 0 },
    by_domain: {},
    by_status: {},
    by_level: {},
    top_categories: [],
    top_tags: [],
  });
}

export async function getForgeItemBySlug(
  slug: string
): Promise<ForgeItem | null> {
  const index = await getForgeIndex();
  const hit = index.items.find((item) => item.slug === slug);
  if (hit) return hit;
  const archive = await getArchiveIndex();
  return archive.items.find((item) => item.slug === slug) ?? null;
}

export async function readForgeMarkdown(sourcePath: string): Promise<string> {
  try {
    const full = path.isAbsolute(sourcePath)
      ? sourcePath
      : path.join(root, sourcePath);
    return await fs.readFile(full, "utf-8");
  } catch {
    return "";
  }
}

export function parseClassification(mdText: string): Record<string, string> {
  if (!mdText.includes("CLASSIFICATION")) return {};
  const parts = mdText.split("CLASSIFICATION");
  const block = parts.length > 1 ? parts[1] : "";
  const data: Record<string, string> = {};
  for (const raw of block.split("\n")) {
    const line = raw.trim();
    if (!line || !line.includes(":")) continue;
    const [k, v] = line.split(":", 2);
    data[k.trim().toUpperCase()] = v.trim();
  }
  return data;
}
