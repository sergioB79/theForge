"use client";

import { useSearchParams } from "next/navigation";

type ArchiveItem = {
  id: string;
  title: string;
  domain: string;
  slug: string;
  category?: string;
  level?: string;
  subtitle?: string | null;
};

const allowedDomains = new Set(["movies", "books", "persons", "others", "ideas"]);

export default function ArchiveList({ items }: { items: ArchiveItem[] }) {
  const searchParams = useSearchParams();
  const domainParam = (searchParams.get("domain") || "").toLowerCase();
  const activeDomain = allowedDomains.has(domainParam) ? domainParam : "";
  const filtered = activeDomain
    ? items.filter((item) => item.domain === activeDomain)
    : items;

  return (
    <>
      {activeDomain && (
        <div className="forge-tag" style={{ marginTop: 16 }}>
          Filter: {activeDomain.toUpperCase()}{" "}
          <a href="/archive" style={{ marginLeft: 10 }}>
            Clear
          </a>
        </div>
      )}

      <section className="forge-card" style={{ marginTop: 32 }}>
        <ul className="forge-list">
          {filtered.length === 0 && (
            <li>
              {activeDomain
                ? "No rejected entries for this domain yet."
                : "No rejected entries yet."}
            </li>
          )}
          {filtered.map((item) => (
            <li key={item.id}>
              <a href={`/forge/${item.domain}/${item.slug}`}>{item.title}</a>
              <div className="forge-tag">
                {item.level ? `Level ${item.level}` : "Rejected"}
                {item.subtitle ? ` — ${item.subtitle}` : ""}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
