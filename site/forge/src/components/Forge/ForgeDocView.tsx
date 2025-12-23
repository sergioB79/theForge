import type { ForgeDoc } from "@/lib/forgeParse";
import styles from "./ForgeDocView.module.css";

function parseTags(raw?: string) {
  if (!raw) return [];
  return raw
    .split(/[;,|]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function statusClass(status?: string) {
  const s = (status || "").toUpperCase();
  if (s.includes("PASSED")) return `${styles.chip} ${styles.chipPassed}`;
  if (s.includes("REJECTED")) return `${styles.chip} ${styles.chipRejected}`;
  return styles.chip;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

type Suggestion = {
  title: string;
  url: string;
  category?: string;
  level?: string;
  subtitle?: string | null;
};

export default function ForgeDocView({
  doc,
  suggestions = [],
}: {
  doc: ForgeDoc;
  suggestions?: Suggestion[];
}) {
  const cls = doc.classification || {};
  const title = cls["TITLE"] || cls["SUBJECT"] || cls["NAME"] || "Untitled";
  const subtitle = cls["SUBTITLE"];
  const info = doc.info;
  const domain = cls["DOMAIN"];
  const category = cls["CATEGORY"];
  const level = cls["FORGE LEVEL"];
  const status = cls["FORGE STATUS"];
  const tags = parseTags(cls["TAGS"]);
  const isPerson = (domain || "").toLowerCase().startsWith("person");
  const invocationText = doc.invocation || "";
  const isRejected = (status || "").toUpperCase().includes("REJECT");

  function costDensityClass(value?: string) {
    const v = (value || "").trim().toLowerCase();
    if (v.startsWith("low")) return styles.costLow;
    if (v.startsWith("moderate")) return styles.costModerate;
    if (v.startsWith("high")) return styles.costHigh;
    if (v.startsWith("extreme")) return styles.costExtreme;
    return styles.costUnknown;
  }

  function renderBlocks(text: string) {
    const blocks = text.split(/\n\s*\n/g).map((b) => b.trim()).filter(Boolean);

    return blocks.map((block, idx) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !/^Inscription:/i.test(l));
      if (!lines.length) return null;

      const first = lines[0];
      const cleanTitle = first.replace(/^\?\s+/, "");
      const rest = lines.slice(1);
      const restAreBullets = rest.length > 0 && rest.every((l) => l.startsWith("- "));
      const allBullets = lines.every((l) => l.startsWith("- "));
      const mdHeading = first.match(/^#{2,3}\s+(.+)$/);

      const headingPattern = /^[A-Z0-9?][A-Z0-9\s\-()?]+$/;
      const isHeading = headingPattern.test(first) && restAreBullets;
      const isHeadingWithBody =
        headingPattern.test(first) && rest.length > 0 && !restAreBullets;

      if (mdHeading) {
        const titleText = mdHeading[1].trim();
        if (!rest.length) {
          return (
            <h2 key={idx} className={styles.sectionTitle}>
              {titleText}
            </h2>
          );
        }
        return (
          <div key={idx} className={styles.block}>
            <h3 className={styles.blockTitle}>{titleText}</h3>
            <div className={styles.sectionBody}>{renderInline(rest.join("\n"))}</div>
          </div>
        );
      }

      if (isHeading) {
        return (
          <div key={idx} className={styles.block}>
            <h3 className={styles.blockTitle}>{cleanTitle}</h3>
            <ul className={styles.bulletList}>
              {rest.map((line) => (
                <li key={line} className={styles.bulletItem}>
                  {renderInline(line.replace(/^- /, ""))}
                </li>
              ))}
            </ul>
          </div>
        );
      }

      if (isHeadingWithBody) {
        return (
          <div key={idx} className={styles.block}>
            <h3 className={styles.blockTitle}>{cleanTitle}</h3>
            <div className={styles.sectionBody}>{renderInline(rest.join("\n"))}</div>
          </div>
        );
      }

      if (allBullets) {
        if (lines.length === 1) {
          const cleaned = lines[0].replace(/^[-–•]\s*/, "");
          return (
            <p key={idx} className={styles.sectionBody}>
              {renderInline(cleaned)}
            </p>
          );
        }
        return (
          <ul key={idx} className={styles.bulletList}>
            {lines.map((line) => (
              <li key={line} className={styles.bulletItem}>
                {renderInline(line.replace(/^- /, ""))}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={idx} className={styles.sectionBody}>
          {renderInline(block)}
        </p>
      );
    });
  }

  function getSection(keys: string[]) {
    for (const key of keys) {
      const value = doc.sections?.[key];
      if (value) return value;
    }
    return "";
  }

  function hasSection(keys: string[]) {
    for (const key of keys) {
      if (doc.sections?.[key]) return true;
    }
    return false;
  }

  function firstSentences(text: string, count: number) {
    const parts = text
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    return parts.slice(0, count).join(" ");
  }

  function parseComponents(text: string) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const items: { name: string; body: string }[] = [];
    let current: { name: string; body: string } | null = null;

    const headingPatterns = [
      /^-\s+\*\*(.+?)\*\*\s*(?:[:\-–—]?\s*(.*))?$/,
      /^\d+[.)]\s+\*\*(.+?)\*\*\s*(?:[:\-–—]?\s*(.*))?$/,
    ];

    for (const line of lines) {
      let match: RegExpMatchArray | null = null;
      for (const pattern of headingPatterns) {
        match = line.match(pattern);
        if (match) break;
      }

      if (match) {
        if (current) items.push(current);
        current = { name: match[1], body: match[2] || "" };
        continue;
      }

      if (current) {
        current.body = current.body ? `${current.body} ${line}` : line;
      }
    }

    if (current) items.push(current);
    return items;
  }

  function parseBullets(text: string) {
    const lines = text.split("\n").map((l) => l.trim());
    const items: string[] = [];
    let current: string | null = null;

    for (const line of lines) {
      if (!line) continue;
      const dash = line.match(/^- (.+)$/);
      const numbered = line.match(/^\d+[.)]\s+(.+)$/);
      if (dash || numbered) {
        if (current) items.push(current);
        current = (dash ? dash[1] : numbered?.[1]) || "";
        continue;
      }
      if (current) current = `${current} ${line}`;
    }

    if (current) items.push(current);
    return items;
  }

  function renderPreForge(text: string) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    return (
      <ul className={styles.bulletList}>
        {lines.map((line) => {
          const content = line.replace(/^- /, "");
          const idx = content.indexOf("?");
          if (idx !== -1) {
            const question = content.slice(0, idx + 1);
            const rest = content.slice(idx + 1).trim();
            return (
              <li key={content} className={styles.bulletItem}>
                <span className={styles.preForgeQuestion}>{renderInline(question)}</span>
                {rest ? <> {renderInline(rest)}</> : ""}
              </li>
            );
          }
          return (
            <li key={content} className={styles.bulletItem}>
              {renderInline(content)}
            </li>
          );
        })}
      </ul>
    );
  }

  const whatMakes = getSection([
    "WHAT MAKES IT FORGE MATERIAL?",
    "C) WHAT MAKES IT FORGE MATERIAL?",
    "WHAT MAKES THIS FILM FORGE MATERIAL?",
    "C) WHAT MAKES THIS FILM FORGE MATERIAL?",
    "WHAT MAKES THIS BOOK FORGE MATERIAL?",
    "C) WHAT MAKES THIS BOOK FORGE MATERIAL?",
    "WHAT MAKES THIS LIFE FORGE MATERIAL?",
    "C) WHAT MAKES THIS LIFE FORGE MATERIAL?",
    "WHAT MAKES THIS SYSTEM FORGE MATERIAL?",
    "C) WHAT MAKES THIS SYSTEM FORGE MATERIAL?",
  ]);
  const preForge = getSection(["A) PRE-FORGE EVALUATION", "PRE-FORGE EVALUATION"]);
  const palladin = getSection(["B) PALLADIN LAYER", "PALLADIN LAYER"]);
  const components = getSection([
    "FORGE COMPONENTS",
    "D) FORGE COMPONENTS (4-5)",
    "D) FORGE COMPONENTS (4-6)",
    "FORGE COMPONENTS (4-6)",
  ]);
  const rejectWhy = getSection([
    "WHY THIS FILM DOES NOT BELONG IN THE FORGE",
    "WHY THIS BOOK DOES NOT BELONG IN THE FORGE",
    "WHY THIS LIFE DOES NOT BELONG IN THE FORGE",
    "WHY THIS SYSTEM DOES NOT BELONG IN THE FORGE",
    "WHY THIS IDEA DOES NOT BELONG IN THE FORGE",
    "WHY THIS WORK DOES NOT BELONG IN THE FORGE",
    "WHY THIS DOES NOT BELONG IN THE FORGE",
  ]);
  const whyFeels = getSection(["WHY IT FEELS WORTHY"]);
  const whyFails = getSection(["WHY IT FAILS THE FORGE"]);
  const verdict = getSection(["VERDICT"]);
  const archive = getSection(["ARCHIVE"]);
  const instructions = getSection([
    "INSTRUCTIONS FOR VIEWING",
    "INSTRUCTIONS FOR OBSERVATION",
    "E) INSTRUCTIONS FOR VIEWING",
    "FORGE RITUAL - HOW TO WATCH",
    "FORGE RITUAL - HOW TO READ",
    "FORGE RITUAL - HOW TO OBSERVE A LIFE",
    "FORGE RITUAL - HOW TO ENCOUNTER THIS SYSTEM",
  ]);
          const usesRitual = hasSection([
    "FORGE RITUAL - HOW TO WATCH",
    "FORGE RITUAL - HOW TO READ",
    "FORGE RITUAL - HOW TO OBSERVE A LIFE",
    "FORGE RITUAL - HOW TO ENCOUNTER THIS SYSTEM",
  ]);
  const legacy = getSection(["LEGACY IN THE FORGE", "F) LEGACY IN THE FORGE"]);
  const mechanism = getSection([
    "H) MECHANISM MAP (TECHNICAL - OPTIONAL, CONTROLLED)",
    "H) MECHANISM MAP (TECHNICAL — OPTIONAL, CONTROLLED)",
  ]);
  const justification = getSection(["J) FORGE HARD MODE JUSTIFICATION (MANDATORY)"]);

  return (
    <article className={`${styles.doc} ${styles.forgeContent}`}>
      <header className={styles.hero}>
        <div className={styles.chips}>
          {domain && <span className={styles.chip}>{domain}</span>}
          {category && <span className={styles.chip}>{category}</span>}
          {level && <span className={styles.chip}>Level {level}</span>}
          <span className={statusClass(status)}>{status || "UNKNOWN"}</span>
        </div>

        <h1 className={styles.title}>{title}</h1>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

        <div className={styles.metaLine}>
          {cls["YEAR"] ? <span>{cls["YEAR"]}</span> : null}
          {cls["DIRECTOR"] ? <span> - {cls["DIRECTOR"]}</span> : null}
          {cls["AUTHOR"] ? <span> - {cls["AUTHOR"]}</span> : null}
          {cls["COUNTRY"] ? <span> - {cls["COUNTRY"]}</span> : null}
        </div>

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((t) => (
              <span key={t} className={styles.chip}>
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      <p className={styles.methodology}>
        This entry was evaluated using Forge methodology.{" "}
        <a href="/how-the-forge-works">Learn more</a>.
      </p>

      {doc.bodyIntro && (
        <section className={styles.intro}>{renderBlocks(doc.bodyIntro)}</section>
      )}

      {info && (
        <section className={styles.intro}>
          <h2 className={styles.sectionTitle}>POINT OF ENTRY</h2>
          <div className={styles.sectionBody}>{renderInline(info)}</div>
        </section>
      )}

      {invocationText && (
        <section className={styles.invocation}>
          {invocationText
            .split(/\n\s*\n/g)
            .map((para) => para.trim())
            .filter(Boolean)
            .map((para, idx) => (
              <p key={idx} className={styles.invocationPara}>
                {renderInline(para)}
              </p>
            ))}
        </section>
      )}

      {preForge && (
        <section className={styles.hardMode}>
          <details className={styles.classification} open>
            <summary className={styles.hardModeSummary}>PRE-FORGE EVALUATION</summary>
            <div className={styles.hardModeBody}>{renderPreForge(preForge)}</div>
          </details>
        </section>
      )}

      {isRejected && rejectWhy && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>WHY THIS DOES NOT BELONG IN THE FORGE</h2>
          <div>{renderBlocks(rejectWhy)}</div>
        </section>
      )}

      {isRejected && whyFeels && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>WHY IT FEELS WORTHY</h2>
          {parseBullets(whyFeels).length > 0 ? (
            <ul className={styles.bulletList}>
              {parseBullets(whyFeels).map((line) => (
                <li key={line} className={styles.bulletItem}>
                  {renderInline(line)}
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.sectionBody}>{renderInline(whyFeels)}</div>
          )}
        </section>
      )}

      {isRejected && whyFails && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>WHY IT FAILS THE FORGE</h2>
          {parseBullets(whyFails).length > 0 ? (
            <ul className={styles.bulletList}>
              {parseBullets(whyFails).map((line) => (
                <li key={line} className={styles.bulletItem}>
                  {renderInline(line)}
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.sectionBody}>{renderInline(whyFails)}</div>
          )}
        </section>
      )}

      {isRejected && verdict && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>VERDICT</h2>
          <div className={styles.sectionBody}>{renderInline(verdict)}</div>
        </section>
      )}

      {isRejected && archive && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>ARCHIVE</h2>
          <div className={styles.sectionBody}>{renderInline(archive)}</div>
        </section>
      )}

      {!isPerson && palladin && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>PALLADIN LAYER</h2>
          <p className={styles.sectionBody}>
            {renderInline(
              palladin.replace(/^-\s+/gm, "").replace(/\s+/g, " ").trim()
            )}
          </p>
        </section>
      )}

      {components && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>FORGE COMPONENTS</h2>
          <div className={styles.cardGrid}>
            {parseComponents(components).map((c) => (
              <div key={c.name} className={styles.card}>
                <div className={styles.cardTitle}>{renderInline(c.name)}</div>
                <div className={styles.cardBody}>{renderInline(c.body)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {instructions && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {usesRitual ? "FORGE RITUAL" : isPerson ? "INSTRUCTIONS FOR OBSERVATION" : "INSTRUCTIONS FOR VIEWING"}
          </h2>
          {parseBullets(instructions).length > 0 ? (
            <ul className={styles.bulletList}>
              {parseBullets(instructions).map((line) => (
                <li key={line} className={styles.bulletItem}>
                  {renderInline(line)}
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.sectionBody}>{renderInline(instructions)}</div>
          )}
        </section>
      )}

      {whatMakes && !isRejected && (
        <section className={styles.tldr}>
          <div className={styles.tldrLabel}>FORGE VERDICT</div>
          <p className={styles.sectionBody}>{renderInline(firstSentences(whatMakes, 3))}</p>
        </section>
      )}

      {legacy && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>LEGACY IN THE FORGE</h2>
          <div>{renderBlocks(legacy)}</div>
        </section>
      )}

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
            id="bd-email-inline"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
          <button type="submit">Join the Forgeletter</button>
        </form>
      </section>

      {!isPerson && doc.inscription && (
        <section className={styles.inscription}>
          <h2 className={styles.inscriptionTitle}>INSCRIPTION</h2>
          <p className={styles.inscriptionText}>
            <em>{doc.inscription}</em>
          </p>
        </section>
      )}

      {!isPerson && mechanism && (
        <section className={styles.hardMode}>
          <details className={styles.classification}>
            <summary className={styles.hardModeSummary}>
              MECHANISM MAP (TECHNICAL)
            </summary>
            <div className={styles.hardModeBody}>{renderInline(mechanism)}</div>
          </details>
        </section>
      )}

      {Object.keys(cls).length > 0 && (
        <section className={styles.hardMode}>
          <details className={styles.classification} open>
            <summary className={styles.hardModeSummary}>FORGE CLASSIFICATION</summary>
            <div className={styles.classGrid}>
              {Object.entries(cls).map(([k, v]) => (
                <div key={k} className={styles.classRow}>
                  <div className={styles.classKey}>{k}</div>
                  <div className={styles.classVal}>
                    {v}
                    {isPerson && k === "STRUCTURAL COST DENSITY" && (
                      <span className={`${styles.costChip} ${costDensityClass(v)}`} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {!isPerson && (justification || doc.hardMode) && (
        <section className={styles.hardMode}>
          <details className={styles.classification}>
            <summary className={styles.hardModeSummary}>
              FORGE HARD MODE JUSTIFICATION
            </summary>
            <div className={styles.hardModeBody}>
              {justification || doc.hardMode}
            </div>
          </details>
        </section>
      )}

      {!isPerson && suggestions.length > 0 && (
        <section className={styles.suggestions}>
          <h3 className={styles.sectionTitle}>Suggested by tags</h3>
          <ul className={styles.suggestionList}>
            {suggestions.map((s) => (
              <li key={s.url} className={styles.suggestionItem}>
                <a href={s.url} className={styles.suggestionTitle}>
                  {s.title}
                </a>
                {(s.category || s.level) && (
                  <div className={styles.suggestionMeta}>
                    {s.level ? `Level ${s.level}` : "Level ?"}
                    {s.subtitle ? ` — ${s.subtitle}` : ""}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
