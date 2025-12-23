import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

type DossierDoc = {
  label: string;
  title: string;
  html: string;
};

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

function loadDossier(slug: string): DossierDoc | null {
  const dossierDir = resolveDossierDir();
  if (!dossierDir) {
    return null;
  }

  const safeSlug = decodeURIComponent(slug);
  let dossierPath = path.join(dossierDir, `${safeSlug}.md.html`);

  if (!fs.existsSync(dossierPath)) {
    const files = fs.readdirSync(dossierDir).filter((name) => {
      const lower = name.toLowerCase();
      return lower.endsWith(".md.html") || lower.endsWith(".html");
    });
    const match = files.find((name) => {
      const base = name.replace(/\.md\.html$/i, "").replace(/\.html$/i, "");
      return slugify(base) === safeSlug.toLowerCase();
    });
    if (!match) {
      return null;
    }
    dossierPath = path.join(dossierDir, match);
  }

  const html = fs.readFileSync(dossierPath, "utf-8");
  const label = extractClass(html, "dossier-label") || "DOSSIER";
  const title =
    extractTag(html, "h1") ||
    extractTag(html, "h2") ||
    safeSlug.replace(/-/g, " ");

  return { label, title, html };
}

export default async function DossierDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = loadDossier(slug);

  if (!doc) {
    return (
      <main className="forge-shell">
        <span className="forge-eyebrow">THE DOSSIER</span>
        <h1 className="forge-title">Not found.</h1>
        <p className="forge-lead">No dossier exists for this slug.</p>
      </main>
    );
  }

  return (
    <main className="forge-shell">
      <div className="forge-card" style={{ marginTop: 32 }}>
        <div className="forge-prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>

      <section className="forge-newsletter forge-newsletterInline">
        <div className="forge-tag">THE FORGELETTER</div>
        <h3 className="forge-newsletterTitle">If this lit something in you, join us.</h3>
        <p className="forge-newsletterText">
          New entries, rejected rites, and behind-the-anvil notes. No noise, just heat.
        </p>
        <form
          className="forge-newsletterForm"
          action="https://buttondown.email/api/emails/embed-subscribe/theforge"
          method="post"
          target="popupwindow"
        >
          <input
            id="bd-email-dossier"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
          <button type="submit">Join the Forgeletter</button>
        </form>
      </section>

      <div className="forge-end-logo">
        <a href="/" aria-label="Back to The Forge">
          <span className="forge-end-flame" aria-hidden="true" />
          <img src="/img/theForge_logo.png" alt="The Forge" width={280} height={280} />
        </a>
      </div>
    </main>
  );
}
