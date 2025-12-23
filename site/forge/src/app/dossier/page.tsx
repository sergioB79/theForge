import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

type DossierEntry = {
  slug: string;
  label: string;
  title: string;
  excerpt: string;
  fileName: string;
};

const FEATURED_DOSSIER = "how-to-read-a-forge-dossier.html";
const FEATURED_TITLE = "How to Read a Forge Dossier";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function extractTag(html: string, tag: string): string {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(
    html
  );
  return match ? stripTags(match[1]) : "";
}

function extractClass(html: string, className: string): string {
  const match = new RegExp(
    `<[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)</[^>]+>`,
    "i"
  ).exec(html);
  return match ? stripTags(match[1]) : "";
}

function resolveDossierDir(): string | null {
  let current = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    const direct = path.join(current, "content", "editorial", "dossier");
    if (fs.existsSync(direct)) {
      return direct;
    }
    const nested = path.join(current, "site", "forge", "content", "editorial", "dossier");
    if (fs.existsSync(nested)) {
      return nested;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return null;
}

function getDossiers(): DossierEntry[] {
  const dossierDir = resolveDossierDir();
  if (!dossierDir || !fs.existsSync(dossierDir)) {
    return [];
  }

  const files = fs.readdirSync(dossierDir).filter((name) => {
    const lower = name.toLowerCase();
    return lower.endsWith(".md.html") || lower.endsWith(".html");
  });
  const filtered = files.filter((name) => name !== FEATURED_DOSSIER);
  return filtered.map((name) => {
    const base = name.replace(/\.md\.html$/i, "").replace(/\.html$/i, "");
    const slug = slugify(base);
    const fullPath = path.join(dossierDir, name);
    const html = fs.readFileSync(fullPath, "utf-8");

    const label = extractClass(html, "dossier-label") || "DOSSIER";
    const title = extractTag(html, "h1") || extractTag(html, "h2") || slug.replace(/-/g, " ");
    const excerpt = extractTag(html, "p");

    return { slug, label, title, excerpt, fileName: name };
  });
}

function getFeaturedDossierSlug(): string | null {
  const dossierDir = resolveDossierDir();
  if (!dossierDir || !fs.existsSync(dossierDir)) {
    return null;
  }
  const featuredPath = path.join(dossierDir, FEATURED_DOSSIER);
  if (!fs.existsSync(featuredPath)) {
    return null;
  }
  const base = FEATURED_DOSSIER.replace(/\.md\.html$/i, "").replace(/\.html$/i, "");
  return slugify(base);
}

export default function DossierPage() {
  const dossiers = getDossiers();
  const featuredSlug = getFeaturedDossierSlug();

  return (
    <main className="forge-shell">
      <span className="forge-eyebrow">THE DOSSIER</span>
      <h1 className="forge-title">Incisions inside the canon.</h1>
      <p className="forge-lead">
        Dossiers are anchored to passed works. This space holds the precise
        mechanisms that do not fit inside a full Forge review.
      </p>

      {featuredSlug && (
        <section className="forge-card" style={{ marginTop: 32 }}>
          <p className="forge-eyebrow">ENTRY GUIDE</p>
          <h2 className="forge-section-title">{FEATURED_TITLE}</h2>
          <p className="forge-lead" style={{ marginTop: 8 }}>
            A short orientation for reading a Forge dossier without drifting into taste or sentiment.
          </p>
          <a className="forge-link" href={`/dossier/${featuredSlug}`} style={{ marginTop: 12, display: "inline-block" }}>
            Read the guide
          </a>
        </section>
      )}

      <section className="forge-card" style={{ marginTop: featuredSlug ? 28 : 32 }}>
        {dossiers.length === 0 ? (
          <p>No dossiers yet. Create dossiers after importing content.</p>
        ) : (
          <div className="forge-grid" style={{ gap: 24 }}>
            {dossiers.map((doc) => (
              <article key={doc.slug}>
                <a href={`/dossier/${doc.slug}`}>
                  <p className="forge-eyebrow">{doc.label}</p>
                  <h2 className="forge-section-title">{doc.title}</h2>
                  {doc.excerpt ? <p>{doc.excerpt}</p> : null}
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
