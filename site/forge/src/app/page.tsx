import styles from "./page.module.css";

export default function Home() {
  return (
    <main className="forge-shell">
      <section className={styles.hero}>
        <span className="forge-eyebrow">THE FURNACE</span>
        <div className={styles.heroTitleRow}>
          <div className={styles.heroLogoWrap}>
            <span className={styles.heroFlame} aria-hidden="true" />
            <img
              className={styles.heroLogo}
              src="/img/theForge_logo.png"
              alt="The Forge"
              width={220}
              height={220}
            />
          </div>
          <h1 className={styles.heroTitle}>
            Not everything
            <br />
            deserves to be remembered.
          </h1>
        </div>
        <p className="forge-lead">
          THE FORGE is not a recommendation engine. It is a system for testing
          whether ideas, works, and lives leave behind structures that endure
          after charm is removed.
        </p>
        <p className="forge-lead">Most things fail. That is expected.</p>
        <div className={styles.ctaRow}>
          <a className={styles.ctaPrimary} href="/crucible">
            Enter the Furnace
          </a>
          <a className={styles.ctaSecondary} href="/manifesto">
            Read the <span className={styles.ctaAccent}>Manifesto</span>
          </a>
        </div>
      </section>

      <section className={styles.metaGrid}>
        <div className={styles.metaBlock}>
          <h3>Rule of Entry</h3>
          <p>If the style burns away, does anything true remain?</p>
        </div>
        <div className={styles.metaBlock}>
          <h3>Judgment System</h3>
          <p>Passes only if structure survives and replaces what it dismantles.</p>
        </div>
        <div className={styles.metaBlock}>
          <h3>Method</h3>
          <p>No rankings by popularity. No comfort. Only durable discipline.</p>
        </div>
      </section>

      <section id="forgeletter" className="forge-newsletter">
        <div className="forge-tag">THE FORGELETTER</div>
        <h2 className="forge-newsletterTitle">Letters from the Forge</h2>
        <p className="forge-newsletterText">
          Get new entries, rejected rites, and behind-the-anvil thoughts. No noise, just
          heat.
        </p>
        <form
          className="forge-newsletterForm"
          action="https://buttondown.email/api/emails/embed-subscribe/theforge"
          method="post"
          target="popupwindow"
        >
          <label className="forge-newsletterLabel" htmlFor="bd-email">
            Email
          </label>
          <input
            id="bd-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
          <button type="submit">Join the Forgeletter</button>
        </form>
      </section>
    </main>
  );
}
