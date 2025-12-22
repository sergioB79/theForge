import { getStats } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function IndexPage() {
  const stats = await getStats();

  return (
    <main className="forge-shell">
      <span className="forge-eyebrow">THE INDEX</span>
      <h1 className="forge-title">Cold control. Clear sight.</h1>
      <p className="forge-lead">
        Filters, counts, and totals. No ceremony. No narrative.
      </p>

      <section className="forge-grid forge-grid-2" style={{ marginTop: 32 }}>
        <div className="forge-card">
          <div className="forge-tag">Totals</div>
          <div className="forge-statGrid" style={{ marginTop: 12 }}>
            <div className="forge-stat">
              <div className="forge-statValue">{stats.totals.all}</div>
              <div className="forge-statLabel">All entries</div>
            </div>
            <div className="forge-stat">
              <div className="forge-statValue">{stats.totals.passed}</div>
              <div className="forge-statLabel">Passed</div>
            </div>
            <div className="forge-stat">
              <div className="forge-statValue">{stats.totals.rejected}</div>
              <div className="forge-statLabel">Rejected</div>
            </div>
          </div>
        </div>
        <div className="forge-card">
          <div className="forge-tag">Top Categories</div>
          {stats.top_categories.length === 0 ? (
            <p style={{ marginTop: 10 }}>No data yet.</p>
          ) : (
            <div className="forge-chipGrid" style={{ marginTop: 12 }}>
              {stats.top_categories.slice(0, 12).map(([cat, count]) => (
                <span key={cat} className="forge-chip">
                  <span className="forge-chipLabel">{cat}</span>
                  <span className="forge-chipCount">{count}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
