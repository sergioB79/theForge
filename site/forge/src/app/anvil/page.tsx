import { getForgeIndex } from "@/lib/content";

export default async function AnvilPage() {
  const index = await getForgeIndex();
  const items = index.items;
  const pick =
    items.length > 0 ? items[Math.floor(Math.random() * items.length)] : null;

  return (
    <main className="forge-shell">
      <span className="forge-eyebrow">THE ANVIL</span>
      <h1 className="forge-title">Strike to meet what you did not select.</h1>
      <p className="forge-lead">
        One click. No previews. No safety. The forge chooses.
      </p>

      <section className="forge-card" style={{ marginTop: 32 }}>
        {pick ? (
          <>
            <div className="forge-tag">Selected</div>
            <h2 style={{ marginTop: 12 }}>{pick.title}</h2>
            <p className="forge-tag">
              Level {pick.level}
              {pick.subtitle ? ` — ${pick.subtitle}` : ""}
            </p>
            <div style={{ marginTop: 18 }}>
              <a className="forge-status passed" href={`/forge/${pick.domain}/${pick.slug}`}>
                Open review
              </a>
            </div>
          </>
        ) : (
          <p>No passed entries available yet.</p>
        )}
      </section>
    </main>
  );
}

