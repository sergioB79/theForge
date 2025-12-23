export type ForgeDoc = {
  bodyIntro?: string;
  invocation?: string;
  info?: string;
  sections: Record<string, string>;
  classification: Record<string, string>;
  hardMode?: string;
  inscription?: string;
};

const SECTION_KEYS = [
  "INVOCATION",
  "A) PRE-FORGE EVALUATION",
  "B) PALLADIN LAYER",
  "C) WHAT MAKES IT FORGE MATERIAL?",
  "C) WHAT MAKES THIS FILM FORGE MATERIAL?",
  "C) WHAT MAKES THIS BOOK FORGE MATERIAL?",
  "C) WHAT MAKES THIS LIFE FORGE MATERIAL?",
  "C) WHAT MAKES THIS SYSTEM FORGE MATERIAL?",
  "D) FORGE COMPONENTS (4-5)",
  "D) FORGE COMPONENTS (4-6)",
  "E) INSTRUCTIONS FOR VIEWING",
  "F) LEGACY IN THE FORGE",
  "H) MECHANISM MAP (TECHNICAL - OPTIONAL, CONTROLLED)",
  "I) CLASSIFICATION (MACHINE-READABLE, EXACT FIELDS)",
  "J) FORGE HARD MODE JUSTIFICATION (MANDATORY)",
  "PRE-FORGE EVALUATION",
  "PALLADIN LAYER",
  "FORGE VERDICT",
  "WHAT MAKES IT FORGE MATERIAL?",
  "WHAT MAKES THIS FILM FORGE MATERIAL?",
  "WHAT MAKES THIS BOOK FORGE MATERIAL?",
  "WHAT MAKES THIS LIFE FORGE MATERIAL?",
  "WHAT MAKES THIS SYSTEM FORGE MATERIAL?",
  "FORGE COMPONENTS",
  "FORGE COMPONENTS (4-6)",
  "INSTRUCTIONS FOR VIEWING",
  "INSTRUCTIONS FOR OBSERVATION",
  "FORGE RITUAL - HOW TO WATCH",
  "FORGE RITUAL - HOW TO READ",
  "FORGE RITUAL - HOW TO OBSERVE A LIFE",
  "FORGE RITUAL - HOW TO ENCOUNTER THIS SYSTEM",
  "LEGACY IN THE FORGE",
  "WHY THIS FILM DOES NOT BELONG IN THE FORGE",
  "WHY THIS BOOK DOES NOT BELONG IN THE FORGE",
  "WHY THIS LIFE DOES NOT BELONG IN THE FORGE",
  "WHY THIS SYSTEM DOES NOT BELONG IN THE FORGE",
  "WHY THIS IDEA DOES NOT BELONG IN THE FORGE",
  "WHY THIS WORK DOES NOT BELONG IN THE FORGE",
  "WHY THIS DOES NOT BELONG IN THE FORGE",
  "WHY IT FEELS WORTHY",
  "WHY IT FAILS THE FORGE",
  "VERDICT",
  "ARCHIVE",
  "INSCRIPTION",
  "CLASSIFICATION",
  "FORGE HARD MODE - NON-NEGOTIABLE RULES",
  "INFO",
];







function splitBySectionMarkers(md: string) {
  const escapeRegex = (value: string) =>
    value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

  const pattern = new RegExp(
    `^\\s*(?:#{1,6}\\s*)?(${SECTION_KEYS.map((s) => escapeRegex(s)).join("|")})\\s*$`,
    "gm"
  );

  const parts: { key: string; start: number; end: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(md)) !== null) {
    parts.push({
      key: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return parts;
}

function normalizeForgeMarkdown(md: string) {
  let text = md.replace(/\r\n/g, "\n");
  text = text.replace(/\u00a0/g, " ");

  const normalizeHeadingLine = (line: string) =>
    line
      .replace(/\u0192\?\"/g, "-")
      .replace(/\u0192\?/g, "-")
      .replace(/[\u2010-\u2015]/g, "-");

  // Normalize dash variants and mojibake inside headings for consistent matching.
  text = text.replace(/^(#{1,6}\s*[A-Z0-9].*)$/gm, (line) =>
    normalizeHeadingLine(line)
  );

  // Also normalize uppercase section labels that appear without heading markers.
  text = text.replace(
    /^(\s*(?:#{1,6}\s*)?[A-Z0-9][A-Z0-9\s\-()?\u2010-\u2015]+)$/gm,
    (line) => normalizeHeadingLine(line)
  );

  // Break inline headings like " -- ## SECTION" or "... ## SECTION" into new lines.
  text = text.replace(/\s*--\s*(##\s*[A-Z0-9])/g, "\n\n$1");
  text = text.replace(/(^|[^\n])\s*(##\s*[A-Z0-9])/g, (match, lead, heading) => {
    if (!lead) return heading;
    return `${lead}\n\n${heading}`;
  });
  text = text.replace(/(\S)\s+(##\s+)/g, "$1\n\n$2");

  // Break inline separators and list items into new lines.
  text = text.replace(/\s*---\s*(##\s*[A-Z0-9])/g, "\n\n$1");
  text = text.replace(/([^\n])\s+(-\s+\*\*)/g, "$1\n$2");
  text = text.replace(/([^\n])\s+(\d+[.)]\s+\*\*)/g, "$1\n$2");
  text = text.replace(/(##[^\n]+)\s+(-\s+\*\*)/g, "$1\n$2");

  // Final guardrails: force headings and list items to start on their own lines.
  text = text.replace(/##\s*[A-Z0-9][^\n]*/g, (m, _g1, idx) => {
    if (idx > 0 && text[idx - 1] !== "\n") return `\n\n${m}`;
    return m;
  });
  text = text.replace(/([^\n])(-\s+\*\*)/g, "$1\n$2");
  text = text.replace(/([^\n])(\d+[.)]\s+\*\*)/g, "$1\n$2");

  // Normalize section lines with noisy prefixes/suffixes into headings.
  const forceHeading = (pattern: RegExp, label: string) => {
    text = text.replace(pattern, `\n\n## ${label}\n`);
  };

  text = text.replace(/^[^\n]*WHY IT FEELS WORTHY\s*:\s*(.+)$/gim, "## WHY IT FEELS WORTHY\n$1");
  text = text.replace(/^[^\n]*WHY IT FAILS THE FORGE\s*:\s*(.+)$/gim, "## WHY IT FAILS THE FORGE\n$1");
  text = text.replace(/^[^\n]*VERDICT\s*:\s*(.+)$/gim, "## VERDICT\n$1");
  text = text.replace(/^[^\n]*ARCHIVE\s*:\s*(.+)$/gim, "## ARCHIVE\n$1");

  forceHeading(/^[^\n]*WHAT MAKES IT FORGE MATERIAL\?[^\n]*$/gim, "WHAT MAKES IT FORGE MATERIAL?");
  forceHeading(
    /^[^\n]*WHAT MAKES THIS FILM FORGE MATERIAL\?[^\n]*$/gim,
    "WHAT MAKES THIS FILM FORGE MATERIAL?"
  );
  forceHeading(
    /^[^\n]*WHAT MAKES THIS BOOK FORGE MATERIAL\?[^\n]*$/gim,
    "WHAT MAKES THIS BOOK FORGE MATERIAL?"
  );
  forceHeading(
    /^[^\n]*WHAT MAKES THIS LIFE FORGE MATERIAL\?[^\n]*$/gim,
    "WHAT MAKES THIS LIFE FORGE MATERIAL?"
  );
  forceHeading(
    /^[^\n]*WHAT MAKES THIS SYSTEM FORGE MATERIAL\?[^\n]*$/gim,
    "WHAT MAKES THIS SYSTEM FORGE MATERIAL?"
  );
  forceHeading(/^[^\n]*FORGE COMPONENTS[^\n]*$/gim, "FORGE COMPONENTS");
  forceHeading(/^[^\n]*INSTRUCTIONS FOR VIEWING[^\n]*$/gim, "INSTRUCTIONS FOR VIEWING");
  forceHeading(/^[^\n]*FORGE RITUAL - HOW TO WATCH[^\n]*$/gim, "FORGE RITUAL - HOW TO WATCH");
  forceHeading(/^[^\n]*FORGE RITUAL - HOW TO READ[^\n]*$/gim, "FORGE RITUAL - HOW TO READ");
  forceHeading(
    /^[^\n]*FORGE RITUAL - HOW TO OBSERVE A LIFE[^\n]*$/gim,
    "FORGE RITUAL - HOW TO OBSERVE A LIFE"
  );
  forceHeading(
    /^[^\n]*FORGE RITUAL - HOW TO ENCOUNTER THIS SYSTEM[^\n]*$/gim,
    "FORGE RITUAL - HOW TO ENCOUNTER THIS SYSTEM"
  );
  forceHeading(/^[^\n]*LEGACY IN THE FORGE[^\n]*$/gim, "LEGACY IN THE FORGE");
  forceHeading(
    /^[^\n]*WHY THIS FILM DOES NOT BELONG IN THE FORGE[^\n]*$/gim,
    "WHY THIS FILM DOES NOT BELONG IN THE FORGE"
  );
  forceHeading(
    /^[^\n]*WHY THIS BOOK DOES NOT BELONG IN THE FORGE[^\n]*$/gim,
    "WHY THIS BOOK DOES NOT BELONG IN THE FORGE"
  );
  forceHeading(
    /^[^\n]*WHY THIS LIFE DOES NOT BELONG IN THE FORGE[^\n]*$/gim,
    "WHY THIS LIFE DOES NOT BELONG IN THE FORGE"
  );
  forceHeading(
    /^[^\n]*WHY THIS SYSTEM DOES NOT BELONG IN THE FORGE[^\n]*$/gim,
    "WHY THIS SYSTEM DOES NOT BELONG IN THE FORGE"
  );
  forceHeading(
    /^[^\n]*WHY THIS IDEA DOES NOT BELONG IN THE FORGE[^\n]*$/gim,
    "WHY THIS IDEA DOES NOT BELONG IN THE FORGE"
  );
  forceHeading(
    /^[^\n]*WHY THIS WORK DOES NOT BELONG IN THE FORGE[^\n]*$/gim,
    "WHY THIS WORK DOES NOT BELONG IN THE FORGE"
  );
  forceHeading(
    /^[^\n]*WHY THIS DOES NOT BELONG IN THE FORGE[^\n]*$/gim,
    "WHY THIS DOES NOT BELONG IN THE FORGE"
  );
  forceHeading(/^[^\n]*WHY IT FEELS WORTHY[^\n]*$/gim, "WHY IT FEELS WORTHY");
  forceHeading(/^[^\n]*WHY IT FAILS THE FORGE[^\n]*$/gim, "WHY IT FAILS THE FORGE");
  forceHeading(/^[^\n]*VERDICT[^\n]*$/gim, "VERDICT");
  forceHeading(/^[^\n]*ARCHIVE[^\n]*$/gim, "ARCHIVE");

  // Normalize "Final line:" into INSCRIPTION.
  text = text.replace(/^Final line:\s*(.*)$/gim, "## INSCRIPTION\n$1");
  text = text.replace(/^INFO:\s*(.*)$/gim, "## INFO\n$1");

  const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Normalize "SECTION:" labels into headings to avoid giant inline blocks.
  for (const key of SECTION_KEYS) {
    const keyPatternLine = new RegExp(
      `(^|\\n)\\s*${escapeRegex(key)}\\s*:\\s*`,
      "g"
    );
    text = text.replace(keyPatternLine, `$1## ${key}\\n`);

    const keyPatternInline = new RegExp(
      `\\s+${escapeRegex(key)}\\s*:\\s*`,
      "g"
    );
    text = text.replace(keyPatternInline, `\\n\\n## ${key}\\n`);
  }

  return text;
}

function extractSubtitle(md: string): string | undefined {
  const m = /^SUBTITLE:\s*(.+)$/im.exec(md);
  return m?.[1]?.trim();
}

function extractTagsBlock(md: string): string | undefined {
  const lines = md.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (/^TAGS\b/i.test(line)) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return undefined;
  const tags: string[] = [];
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) {
      if (tags.length) break;
      continue;
    }
    const bullet = /^[-*+]\s+(.+)$/.exec(line);
    if (bullet?.[1]) {
      let tag = bullet[1].trim().toLowerCase();
      tag = tag.replace(/\s+/g, "-");
      tag = tag.replace(/[^a-z0-9-]+/g, "-");
      tag = tag.replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
      if (tag) tags.push(tag);
      continue;
    }
    if (tags.length) break;
  }
  if (!tags.length) return undefined;
  return tags.join(", ");
}

export function parseForgeMarkdown(md: string): ForgeDoc {
  const normalized = normalizeForgeMarkdown(md);
  let working = normalized;
  const out: ForgeDoc = { sections: {}, classification: {} };

  const invocationHeader = /^\s*INVOCATION\s*$/m;
  const headerMatch = invocationHeader.exec(normalized);
  if (headerMatch) {
    const start = headerMatch.index + headerMatch[0].length;
    const afterHeader = normalized.slice(start).replace(/^\s*\n/, "");
    const separatorMatch = afterHeader.match(
      /^\s*(?:[-─]{8,}|(.)(?:\1){7,})\s*$/m
    );
    const markerParts = splitBySectionMarkers(afterHeader);
    const headingMatch = afterHeader.match(/^[A-Z0-9][A-Z0-9\s\-()?]+$/m);
    const secondInvocation = afterHeader.search(/^\s*INVOCATION\s*$/m);

    let boundary = -1;
    let sepIndex = -1;
    let sepLength = 0;

    if (separatorMatch) {
      sepIndex = afterHeader.indexOf(separatorMatch[0]);
      sepLength = separatorMatch[0].length;
      boundary = sepIndex;
    }

    if (markerParts.length > 0) {
      boundary = boundary === -1 ? markerParts[0].start : Math.min(boundary, markerParts[0].start);
    }

    if (secondInvocation > 0) {
      boundary = boundary === -1 ? secondInvocation : Math.min(boundary, secondInvocation);
    }

    if (headingMatch) {
      const idx = afterHeader.indexOf(headingMatch[0]);
      boundary = boundary === -1 ? idx : Math.min(boundary, idx);
    }

    if (boundary !== -1) {
      const invocationText = afterHeader.slice(0, boundary).trim();
      out.invocation = invocationText || undefined;
      if (sepIndex !== -1 && boundary === sepIndex) {
        working = afterHeader.slice(sepIndex + sepLength).trim();
      } else {
        working = afterHeader.slice(boundary).trim();
      }
    } else {
      const parts = afterHeader.split(/\n\s*\n/);
      out.invocation = parts[0].trim() || undefined;
      working = parts.slice(1).join("\n\n").trim();
    }
  }

  const markers = splitBySectionMarkers(working);

  if (!markers.length) {
    out.bodyIntro = working.trim() || undefined;
    return out;
  }

  out.bodyIntro = working.slice(0, markers[0].start).trim() || undefined;

  for (let i = 0; i < markers.length; i++) {
    const curr = markers[i];
    const next = markers[i + 1];
    const contentStart = curr.end;
    const contentEnd = next ? next.start : working.length;
    const content = working.slice(contentStart, contentEnd).trim();

    if (curr.key.includes("INVOCATION")) {
      if (!out.invocation) {
        out.invocation = content || undefined;
      }
    } else if (curr.key.includes("CLASSIFICATION")) {
      // fallback for broken "KEY\\nVALUE" lines
      const lines = content
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const knownKeys = new Set([
        "DOMAIN",
        "TITLE",
        "SUBJECT",
        "PRIMARY CATEGORY",
        "CATEGORY",
        "FORGE LEVEL",
        "FORGE STATUS",
        "TAGS",
        "YEAR",
        "COUNTRY",
        "DIRECTOR",
        "AUTHOR",
      ]);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes(":")) {
          const idx = line.indexOf(":");
          const k = line.slice(0, idx).trim().toUpperCase();
          const v = line.slice(idx + 1).trim();
          if (k && v) out.classification[k] = v;
          continue;
        }

        if (knownKeys.has(line.toUpperCase()) && lines[i + 1]) {
          out.classification[line.toUpperCase()] = lines[i + 1].trim();
          i += 1;
        }
      }

      const ins = /Inscription:\s*(.+)$/im.exec(content);
      if (ins?.[1]) out.inscription = ins[1].trim();
    } else if (curr.key.includes("INSCRIPTION")) {
      out.inscription = content || undefined;
    } else if (curr.key.includes("FORGE HARD MODE")) {
      out.hardMode = content || undefined;
    } else {
      out.sections[curr.key] = content;
      const ins = /Inscription:\s*(.+)$/im.exec(content);
      if (ins?.[1]) out.inscription = ins[1].trim();
    }
  }

  if (!out.invocation && out.bodyIntro) {
    out.invocation = out.bodyIntro;
    out.bodyIntro = undefined;
  }

  if (!out.info) {
    const infoSection = out.sections?.["INFO"];
    if (infoSection) out.info = infoSection;
  }

  if (!out.classification.SUBTITLE) {
    const subtitle = extractSubtitle(md);
    if (subtitle) out.classification.SUBTITLE = subtitle;
  }
  if (!out.classification.TAGS) {
    const tags = extractTagsBlock(md);
    if (tags) out.classification.TAGS = tags;
  }

  return out;
}
