"use client";

import { useMemo, useState } from "react";
import styles from "@/app/crucible/page.module.css";

type ForgeItem = {
  id: string;
  domain: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  subtitle?: string | null;
  tags?: string[];
  updated?: number | null;
};

const domainOrder = ["movies", "books", "persons", "others", "ideas"];

export default function CrucibleView({
  items,
  rejectedByDomain,
}: {
  items: ForgeItem[];
  rejectedByDomain: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [randomSeed] = useState(() => Math.random());
  const normalizedQuery = query.trim().toLowerCase();
  const [domainSorts, setDomainSorts] = useState<
    Record<string, "recent" | "alpha" | "random">
  >(() => {
    const init: Record<string, "recent" | "alpha" | "random"> = {};
    domainOrder.forEach((domain) => {
      init[domain] = "random";
    });
    return init;
  });

  const sortItems = (
    list: ForgeItem[],
    mode: "recent" | "alpha" | "random",
    seedKey = ""
  ) => {
    if (mode === "alpha") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (mode === "random") {
      const hash = (value: string) => {
        let h = 0;
        for (let i = 0; i < value.length; i += 1) {
          h = (h << 5) - h + value.charCodeAt(i);
          h |= 0;
        }
        return h;
      };
      const seed = randomSeed + hash(seedKey);
      return [...list].sort((a, b) => {
        const ra = Math.abs(Math.sin(hash(a.id) + seed) * 10000) % 1;
        const rb = Math.abs(Math.sin(hash(b.id) + seed) * 10000) % 1;
        return ra - rb;
      });
    }
    return [...list].sort(
      (a, b) => (b.updated || 0) - (a.updated || 0)
    );
  };

  const byDomain = useMemo(() => {
    return items.reduce<Record<string, ForgeItem[]>>((acc, item) => {
      acc[item.domain] = acc[item.domain] || [];
      acc[item.domain].push(item);
      return acc;
    }, {});
  }, [items]);

  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      (item.tags || []).forEach((tag) => set.add(tag));
    });
    return Array.from(set).sort();
  }, [items]);

  const results = useMemo(() => {
    const q = normalizedQuery;
    const t = tagQuery.trim().toLowerCase();
    if (!q && !t) return [];
    const filtered = items.filter((item) => {
      const haystack = `${item.title} ${item.subtitle || ""} ${item.category || ""}`
        .toLowerCase()
        .trim();
      const matchesText = q ? haystack.includes(q) : true;
      const tags = (item.tags || []).map((tag) => tag.toLowerCase());
      const matchesTag = t ? tags.includes(t) : true;
      return matchesText && matchesTag;
    });
    return sortItems(filtered, "recent");
  }, [items, normalizedQuery, tagQuery, randomSeed]);

  return (
    <>
      <nav className={styles.domainNav}>
        {domainOrder.map((domain) => {
          const list = byDomain[domain] || [];
          if (!list.length) return null;
          return (
            <a key={domain} className={styles.domainLink} href={`#${domain}`}>
              {domain.toUpperCase()}{" "}
              <span className={styles.domainCount}>({list.length})</span>
            </a>
          );
        })}
      </nav>

      <div className={styles.searchRow}>
        <label className={styles.searchLabel} htmlFor="crucible-search">
          Search
        </label>
        <input
          id="crucible-search"
          className={styles.searchInput}
          type="search"
          placeholder="Title, subtitle, or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className={styles.searchLabel} htmlFor="crucible-tag-select">
          Tag
        </label>
        <select
          id="crucible-tag-select"
          className={styles.searchSelect}
          value={tagQuery}
          onChange={(e) => setTagQuery(e.target.value)}
        >
          <option value="">All tags</option>
          {tagOptions.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {(normalizedQuery || tagQuery.trim()) && (
        <section className={`forge-card ${styles.resultsCard}`}>
          <div className={`forge-tag ${styles.domainTitle}`}>Search results</div>
          {results.length === 0 ? (
            <p style={{ marginTop: 12 }}>No matches yet.</p>
          ) : (
            <ul className={`forge-list ${styles.domainList}`}>
              {results.map((item) => (
                <li key={item.id}>
                  <a href={`/forge/${item.domain}/${item.slug}`}>{item.title}</a>
                  <div className="forge-tag">
                    Level {item.level}
                    {item.subtitle ? ` - ${item.subtitle}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!normalizedQuery && !tagQuery.trim() && (
        <section className={styles.domainGrid}>
          {domainOrder.map((domain) => {
            const list = byDomain[domain] || [];
            if (!list.length) return null;
            const mode = domainSorts[domain] || "random";
            const sorted = sortItems(list, mode, domain);
            return (
              <div id={domain} key={domain} className={`forge-card ${styles.domainCard}`}>
                <div className={styles.domainHeader}>
                  <div className={`forge-tag ${styles.domainTitle}`}>
                    {domain.toUpperCase()} - {list.length} passed
                  </div>
                  <div className={styles.domainSort}>
                    {(["random", "alpha", "recent"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`${styles.sortButton} ${
                          mode === value ? styles.sortActive : ""
                        }`}
                        onClick={() =>
                          setDomainSorts((prev) => ({ ...prev, [domain]: value }))
                        }
                      >
                        {value === "random" ? "Random" : value === "alpha" ? "A-Z" : "Recent"}
                      </button>
                    ))}
                  </div>
                </div>
                <ul className={`forge-list ${styles.domainList}`}>
                  {sorted.map((item) => (
                    <li key={item.id}>
                      <a href={`/forge/${item.domain}/${item.slug}`}>{item.title}</a>
                      <div className="forge-tag">
                        Level {item.level}
                        {item.subtitle ? ` - ${item.subtitle}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              <div className={styles.domainFooter}>
                <a className={styles.domainArchive} href={`/archive?domain=${domain}`}>
                  View rejected ({rejectedByDomain[domain] || 0})
                </a>
              </div>
              </div>
            );
          })}
        </section>
      )}
    </>
  );
}
