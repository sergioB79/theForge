import argparse
import json
import os
from pathlib import Path
from typing import List, Optional

import requests


ROOT = Path(__file__).resolve().parent
CONTENT_ROOT = ROOT / "site" / "forge" / "content" / "forge"


def iter_md_files() -> List[Path]:
    return list(CONTENT_ROOT.rglob("*.md"))


def filter_missing_info(files: List[Path]) -> List[Path]:
    missing: List[Path] = []
    for path in files:
        text = path.read_text(encoding="utf-8")
        if not has_info_block(text):
            missing.append(path)
    return missing


def has_info_block(text: str) -> bool:
    return bool(
        (
            "\nINFO\n" in text
            or "\nINFO\r\n" in text
            or "\n## INFO\n" in text
            or "\nINFO:" in text
        )
    )


def extract_subtitle_line(text: str) -> Optional[str]:
    for line in text.splitlines():
        if line.strip().startswith("SUBTITLE:"):
            return line.strip()
    return None


def extract_classification(text: str) -> dict:
    lines = text.splitlines()
    if "---" not in lines:
        return {}
    try:
        first = lines.index("---")
        second = lines.index("---", first + 1)
    except ValueError:
        return {}
    block = lines[first + 1 : second]
    data = {}
    for line in block:
        if ":" in line:
            k, v = line.split(":", 1)
            data[k.strip().upper()] = v.strip()
    return data


def extract_body_snippet(text: str, max_chars: int = 1200) -> str:
    # Strip classification block.
    if "---" in text:
        parts = text.split("---", 2)
        if len(parts) == 3:
            text = parts[2]
    # Strip subtitle line.
    lines = text.splitlines()
    cleaned = []
    for line in lines:
        if line.strip().startswith("SUBTITLE:"):
            continue
        cleaned.append(line)
    snippet = "\n".join(cleaned).strip()
    return snippet[:max_chars]


def build_prompt(title: str, domain: str, category: str, subtitle: str, body: str) -> str:
    return (
        "Write an INFO block for a Forge review.\n"
        "Output format (exact):\n"
        "INFO\n"
        "<line1>\n"
        "<line2>\n"
        "<line3>\n"
        "[optional line4]\n"
        "[optional line5]\n\n"
        "Rules:\n"
        "- 3 to 5 lines total (not counting the INFO line).\n"
        "- Each line is 8-18 words.\n"
        "- No bullets, no numbering, no markdown, no quotes.\n"
        "- Avoid repeating the title verbatim.\n"
        "- Use plain ASCII punctuation.\n\n"
        f"TITLE: {title}\n"
        f"DOMAIN: {domain}\n"
        f"CATEGORY: {category}\n"
        f"SUBTITLE: {subtitle}\n"
        "EXCERPT:\n"
        f"{body}\n"
    )


def extract_response_text(payload: dict) -> str:
    # Prefer output_text if present.
    if "output_text" in payload and isinstance(payload["output_text"], str):
        return payload["output_text"]
    # Fallback to first content block.
    for item in payload.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "output_text" and "text" in content:
                return content["text"]
    return ""


def normalize_info_block(text: str) -> Optional[str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return None
    if lines[0].upper() != "INFO":
        lines.insert(0, "INFO")
    # Keep INFO + next 3-5 lines.
    info_lines = lines[1:]
    if len(info_lines) < 3:
        return None
    info_lines = info_lines[:5]
    return "INFO\n" + "\n".join(info_lines)


def insert_info_block(text: str, block: str) -> str:
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if line.strip().startswith("SUBTITLE:"):
            insert_at = i + 1
            # Skip any blank lines right after subtitle.
            while insert_at < len(lines) and lines[insert_at].strip() == "":
                insert_at += 1
            new_lines = (
                lines[:insert_at]
                + [""]
                + block.splitlines()
                + [""]
                + lines[insert_at:]
            )
            return "\n".join(new_lines) + "\n"
    # Fallback: insert after classification block.
    if "---" in lines:
        try:
            first = lines.index("---")
            second = lines.index("---", first + 1)
            insert_at = second + 1
            new_lines = (
                lines[:insert_at]
                + [""]
                + block.splitlines()
                + [""]
                + lines[insert_at:]
            )
            return "\n".join(new_lines) + "\n"
        except ValueError:
            pass
    # If all else fails, prepend.
    return block + "\n\n" + text


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="gpt-5.1")
    parser.add_argument("--key-env", default="OPENAI_API_KEY2")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--per-domain", type=int, default=0)
    parser.add_argument("--domains", default="")
    args = parser.parse_args()

    api_key = os.getenv(args.key_env)
    if not api_key:
        raise SystemExit(f"Missing {args.key_env}.")

    files = iter_md_files()
    if args.domains:
        allowed = {d.strip().lower() for d in args.domains.split(",") if d.strip()}
        if allowed:
            files = [
                p
                for p in files
                if p.is_relative_to(CONTENT_ROOT)
                and p.relative_to(CONTENT_ROOT).parts[0].lower() in allowed
            ]

    if args.per_domain:
        files = filter_missing_info(files)
        per_domain: dict[str, List[Path]] = {}
        for path in files:
            if not path.is_relative_to(CONTENT_ROOT):
                continue
            rel = path.relative_to(CONTENT_ROOT)
            if not rel.parts:
                continue
            domain = rel.parts[0].lower()
            per_domain.setdefault(domain, []).append(path)
        selected: List[Path] = []
        for domain, items in sorted(per_domain.items()):
            items.sort()
            selected.extend(items[: args.per_domain])
        files = selected
    elif args.limit:
        files = files[: args.limit]

    updated = 0
    skipped = 0
    failed = 0

    for path in files:
        text = path.read_text(encoding="utf-8")
        if has_info_block(text):
            skipped += 1
            continue

        cls = extract_classification(text)
        title = cls.get("TITLE") or cls.get("SUBJECT") or cls.get("NAME") or path.stem
        domain = cls.get("DOMAIN", path.parent.parent.name)
        category = cls.get("CATEGORY", "")
        subtitle_line = extract_subtitle_line(text) or "SUBTITLE:"
        subtitle = subtitle_line.split(":", 1)[1].strip() if ":" in subtitle_line else ""
        body = extract_body_snippet(text)

        prompt = build_prompt(title, domain, category, subtitle, body)

        resp = requests.post(
            "https://api.openai.com/v1/responses",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": args.model,
                "input": prompt,
            },
            timeout=(10, 120),
        )

        if resp.status_code != 200:
            failed += 1
            print(f"[fail] {path}: {resp.status_code} {resp.text[:200]}")
            continue

        payload = resp.json()
        raw = extract_response_text(payload)
        block = normalize_info_block(raw)
        if not block:
            failed += 1
            print(f"[fail] {path}: invalid INFO block")
            continue

        if args.dry_run:
            updated += 1
            print(f"[dry-run] {path}")
            continue

        new_text = insert_info_block(text, block)
        path.write_text(new_text, encoding="utf-8")
        updated += 1
        print(f"[ok] {path}")

    print(f"Done. updated={updated} skipped={skipped} failed={failed}")


if __name__ == "__main__":
    main()
