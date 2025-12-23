const fs = require("node:fs");
const path = require("node:path");

const DOSSIER_DIR = path.join(__dirname, "..", "content", "editorial", "dossier");

const REPLACEMENTS = new Map([
  ["\u201c", "\""],
  ["\u201d", "\""],
  ["\u2018", "'"],
  ["\u2019", "'"],
  ["\u2013", "-"],
  ["\u2014", "-"],
  ["\u00a0", " "],
]);

function normalizeText(input) {
  let text = input;
  for (const [from, to] of REPLACEMENTS.entries()) {
    text = text.split(from).join(to);
  }

  // Strip contentReference artifacts.
  text = text.replace(/:contentReference\[[^\]]+\]\{[^}]*\}/g, "");

  // Force tags list to use dossier-tags class.
  text = text.replace(
    /<h3>\s*TAGS\s*<\/h3>\s*<ul>/gi,
    '<h3>TAGS</h3>\n<ul class="dossier-tags">'
  );

  // Put tags and blocks on their own lines.
  text = text.replace(/>\s*</g, ">\n<");

  // Trim and drop empty lines.
  let lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  text = lines.join("\n");

  // Insert blank lines between major blocks.
  text = text.replace(/(<\/div>|<\/h1>|<\/p>|<\/h3>|<\/ul>)\n(?!<li)/g, "$1\n\n");

  // Drop any remaining non-ASCII characters.
  text = text.replace(/[^\x00-\x7F]/g, "");

  return text.trim() + "\n";
}

function main() {
  if (!fs.existsSync(DOSSIER_DIR)) {
    console.log("Dossier directory not found:", DOSSIER_DIR);
    return;
  }

  const files = fs
    .readdirSync(DOSSIER_DIR)
    .filter((name) => name.toLowerCase().endsWith(".html"));

  let updated = 0;
  for (const file of files) {
    const fullPath = path.join(DOSSIER_DIR, file);
    const original = fs.readFileSync(fullPath, "utf-8");
    const normalized = normalizeText(original);
    if (normalized !== original) {
      fs.writeFileSync(fullPath, normalized, "utf-8");
      updated += 1;
      console.log("normalized", file);
    }
  }

  console.log(`Done. updated=${updated}`);
}

main();
