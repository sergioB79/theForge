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
  const normalizedQuery = query.trim().toLowerCase();

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
    return items.filter((item) => {
      const haystack = `${item.title} ${item.subtitle || ""} ${item.category || ""}`
        .toLowerCase()
        .trim();
      const matchesText = q ? haystack.includes(q) : true;
      const tags = (item.tags || []).map((tag) => tag.toLowerCase());
      const matchesTag = t ? tags.includes(t) : true;
      return matchesText && matchesTag;
    });
  }, [items, normalizedQuery, tagQuery]);

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
                    {item.subtitle ? ` — ${item.subtitle}` : ""}
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
            return (
              <div id={domain} key={domain} className={`forge-card ${styles.domainCard}`}>
                <div className={`forge-tag ${styles.domainTitle}`}>
                  {domain.toUpperCase()} - {list.length} passed
                </div>
                <ul className={`forge-list ${styles.domainList}`}>
                  {list.map((item) => (
                    <li key={item.id}>
                      <a href={`/forge/${item.domain}/${item.slug}`}>{item.title}</a>
                      <div className="forge-tag">
                        Level {item.level}
                        {item.subtitle ? ` — ${item.subtitle}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              <div className={styles.domainFooter}>
                <a className={styles.domainArchive} href={`/archive?domain=${domain}`}>
                  Ver rejeitados ({rejectedByDomain[domain] || 0})
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
