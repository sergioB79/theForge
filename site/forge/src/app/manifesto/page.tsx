import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

function resolveManifestoPath(): string | null {
  let current = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    const direct = path.join(current, "content", "editorial", "manifesto", "manifesto.html");
    if (fs.existsSync(direct)) {
      return direct;
    }
    const nested = path.join(
      current,
      "site",
      "forge",
      "content",
      "editorial",
      "manifesto",
      "manifesto.html"
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

export default function ManifestoPage() {
  const manifestoPath = resolveManifestoPath();
  const html = manifestoPath
    ? fs.readFileSync(manifestoPath, "utf-8")
    : "";

  return (
    <main className="forge-shell">
      <span className="forge-eyebrow">THE FORGE — A Manifesto</span>
      <div className="forge-card" style={{ marginTop: 28 }}>
        {html ? (
          <div className="forge-prose" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p>No manifesto found. Add content/editorial/manifesto/manifesto.html.</p>
        )}
      </div>
    </main>
  );
}
