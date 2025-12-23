const analyticsUrl = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_URL || "";

export default function MetricsPage() {
  return (
    <main className="forge-shell">
      <span className="forge-eyebrow">PRIVATE</span>
      <h1 className="forge-title">Site Metrics</h1>
      <p className="forge-lead">
        Live analytics are hosted in Vercel. This page is intentionally unlinked.
      </p>

      <div className="forge-card" style={{ marginTop: 24 }}>
        <h2 className="forge-section-title">Vercel Analytics</h2>
        <p style={{ marginTop: 12 }}>
          View totals, unique visitors, and time-on-site in the Vercel dashboard.
        </p>
        {analyticsUrl ? (
          <a className="forge-link" href={analyticsUrl} target="_blank" rel="noreferrer">
            Open Vercel Analytics
          </a>
        ) : (
          <p style={{ marginTop: 12, color: "var(--forge-text-dim)" }}>
            Set `NEXT_PUBLIC_VERCEL_ANALYTICS_URL` to your Vercel Analytics URL.
          </p>
        )}
      </div>
    </main>
  );
}
