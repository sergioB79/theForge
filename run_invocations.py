import argparse
import os
import re
from pathlib import Path

from openai import OpenAI

# ======================
# CONFIG
# ======================
MODEL = os.getenv("OPENAI_MODEL_INVOCATION", "gpt-4.1-mini")
PROJECT_ROOT = Path(__file__).resolve().parent

PROMPT_PATH = PROJECT_ROOT / "prompts" / "invocation_prompt.txt"

# Pastas de output (ajusta se o teu caminho for diferente)
OUTPUT_ROOT = PROJECT_ROOT / "out"
DOMAIN_FOLDERS = ["books", "movies", "persons", "others"]

# Marcadores no MD
INVOCATION_HEADER = "INVOCATION"
SEPARATOR_LINE = "------------------------"

# ======================
# HELPERS
# ======================
def load_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")

def save_text(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8", newline="\n")

def has_invocation(md: str) -> bool:
    return re.search(r"(?m)^\s*INVOCATION\s*$", md) is not None

def strip_invocations(md: str) -> str:
    text = md
    # Remove one or more leading INVOCATION blocks with separator
    pattern = re.compile(
        r"(?s)^\s*INVOCATION\s*\n.*?\n\s*(?:[-─]{8,}|(.)(?:\1){7,})\s*\n"
    )
    while True:
        new_text = re.sub(pattern, "", text, count=1)
        if new_text == text:
            break
        text = new_text
    # Remove INVOCATION header + first paragraph if no separator
    pattern2 = re.compile(r"(?s)^\s*INVOCATION\s*\n(.*?)(\n\s*\n|$)")
    text = re.sub(pattern2, "", text, count=1)
    return text.lstrip()

def inject_invocation(md: str, invocation: str) -> str:
    invocation = invocation.strip()
    return f"{INVOCATION_HEADER}\n{invocation}\n\n{SEPARATOR_LINE}\n\n{md.lstrip()}"

def generate_invocation(client: OpenAI, sys_prompt: str, md: str) -> str:
    resp = client.responses.create(
        model=MODEL,
        input=[
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": md},
        ],
        max_output_tokens=220,
    )

    text = (resp.output_text or "").strip()
    text = re.sub(r"\n{2,}", " ", text).strip()
    text = re.sub(r"\s{2,}", " ", text).strip()

    words = text.split()
    if len(words) > 200:
        text = " ".join(words[:200]).rstrip() + "..."

    return text

# ======================
# MAIN
# ======================
def main():
    parser = argparse.ArgumentParser(description="Inject invocation paragraphs into Forge .md files.")
    parser.add_argument("--force", action="store_true", help="Replace existing INVOCATION blocks.")
    args = parser.parse_args()

    if not PROMPT_PATH.exists():
        raise FileNotFoundError(f"Missing: {PROMPT_PATH}")

    sys_prompt = load_text(PROMPT_PATH)
    client = OpenAI()

    total = 0
    done = 0
    skipped = 0
    failed = 0

    for folder in DOMAIN_FOLDERS:
        dir_path = OUTPUT_ROOT / folder
        if not dir_path.exists():
            continue

        for md_file in dir_path.rglob("*.md"):
            total += 1
            md = load_text(md_file)

            # Always replace existing INVOCATION to avoid duplicates.
            if has_invocation(md):
                md = strip_invocations(md)
                if not args.force:
                    skipped += 1

            try:
                invocation = generate_invocation(client, sys_prompt, md)
                if not invocation:
                    raise RuntimeError("Empty invocation returned")

                updated = inject_invocation(md, invocation)
                save_text(md_file, updated)

                done += 1
                print(f"[ok] {folder}: {md_file.name}")

            except Exception as e:
                failed += 1
                print(f"[fail] {folder}: {md_file.name} -> {e}")

    print("\nINVOCATION REPORT")
    print(f"Total scanned: {total}")
    print(f"Injected: {done}")
    print(f"Skipped (already had): {skipped}")
    print(f"Failed: {failed}")

if __name__ == "__main__":
    main()
