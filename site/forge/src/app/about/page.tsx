import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function resolveAboutPath(): string | null {
  let current = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    const direct = path.join(
      current,
      "content",
      "editorial",
      "about",
      "about.html"
    );
    if (fs.existsSync(direct)) {
      return direct;
    }
    const nested = path.join(
      current,
      "site",
      "forge",
      "content",
      "editorial",
      "about",
      "about.html"
    );
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

export default function AboutPage() {
  const htmlPath = resolveAboutPath();
  const html = htmlPath ? fs.readFileSync(htmlPath, "utf-8") : "";

  return (
    <main className="forge-shell">
      <span className="forge-eyebrow">ABOUT</span>
      <div className="forge-card" style={{ marginTop: 28 }}>
        {html ? (
          <div className="forge-prose" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p>No document found. Add content/editorial/about/about.html.</p>
        )}
      </div>
    </main>
  );
}
