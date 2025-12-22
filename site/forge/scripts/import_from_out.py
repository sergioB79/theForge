from __future__ import annotations

import argparse
import re
import shutil
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional, Tuple


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or "untitled"


def _clean_key(raw: str) -> str:
    key = re.sub(r"^[#>\-\s]+", "", raw.strip())
    key = re.sub(r"[*_`]+", "", key)
    return key.strip().upper()


def _clean_value(raw: str) -> str:
    val = raw.replace("\u00a0", " ").strip()
    val = re.sub(r"\s+", " ", val)
    val = re.sub(r"^[\s*_`]+", "", val)
    val = re.sub(r"[\s*_`]+$", "", val)
    return val.strip()


def parse_classification(md_text: str) -> Dict[str, str]:
    if "CLASSIFICATION" not in md_text:
        return {}

    block = md_text.split("CLASSIFICATION", 1)[1]
    data: Dict[str, str] = {}

    for raw in block.splitlines():
        line = raw.strip()
        if not line or ":" not in line:
            continue
        k, v = line.split(":", 1)
        key = _clean_key(k)
        val = _clean_value(v)
        if key and val:
            data[key] = val

    return data


def normalize_domain(domain: str) -> str:
    d = domain.strip().lower()
    mapping = {
        "movie": "movies",
        "movies": "movies",
        "film": "movies",
        "films": "movies",
        "book": "books",
        "books": "books",
        "person": "persons",
        "persons": "persons",
        "people": "persons",
        "other": "others",
        "others": "others",
        "idea": "ideas",
        "ideas": "ideas",
    }
    return mapping.get(d, d if d in {"movies", "books", "persons", "others", "ideas"} else "others")


def normalize_status(status: str) -> str:
    s = status.strip().upper()
    if "PASS" in s:
        return "passed"
    if "REJECT" in s:
        return "rejected"
    return "unknown"


RE_CONCLUDE = re.compile(r"(?mi)^Conclude with:\s*(Proceed|Reject)\b")
RE_STANDALONE = re.compile(r"(?mi)^\s*(Proceed|Reject)\.\s*$")


def infer_status(text: str) -> Optional[str]:
    m = RE_CONCLUDE.search(text)
    if m:
        return "passed" if m.group(1).lower() == "proceed" else "rejected"
    m = RE_STANDALONE.search(text)
    if m:
        return "passed" if m.group(1).lower() == "proceed" else "rejected"
    return None


def extract_title(meta: Dict[str, str], fallback_stem: str) -> str:
    return (
        meta.get("TITLE")
        or meta.get("SUBJECT")
        or meta.get("NAME")
        or fallback_stem
    ).strip()


def default_category_for_domain(domain: str) -> str:
    d = (domain or "").strip().lower()
    mapping = {
        "movies": "Movies",
        "books": "Books",
        "persons": "Persons",
        "others": "Others",
        "ideas": "Ideas",
    }
    return mapping.get(d, "General")


def ensure_title_in_classification(md_text: str, title: str) -> str:
    if not title or "CLASSIFICATION" not in md_text:
        return md_text
    lines = md_text.splitlines()
    start = None
    for i, raw in enumerate(lines):
        if re.match(r"(?i)^(##\s*)?CLASSIFICATION\b", raw.strip()):
            start = i
            break
    if start is None:
        return md_text
    end = None
    for i in range(start + 1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        end = len(lines)
    for i in range(start + 1, end):
        if re.match(r"(?i)^(TITLE|SUBJECT|NAME)\s*:", lines[i].strip()):
            return md_text
    insert_at = start + 1
    for i in range(start + 1, end):
        if re.match(r"(?i)^DOMAIN\s*:", lines[i].strip()):
            insert_at = i + 1
            break
    lines.insert(insert_at, f"TITLE: {title}")
    return "\n".join(lines)


def ensure_category_in_classification(md_text: str, category: str) -> str:
    if not category or "CLASSIFICATION" not in md_text:
        return md_text
    lines = md_text.splitlines()
    start = None
    for i, raw in enumerate(lines):
        if re.match(r"(?i)^(##\s*)?CLASSIFICATION\b", raw.strip()):
            start = i
            break
    if start is None:
        return md_text
    end = None
    for i in range(start + 1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        end = len(lines)
    for i in range(start + 1, end):
        if re.match(r"(?i)^(CATEGORY|PRIMARY CATEGORY)\s*:", lines[i].strip()):
            return md_text
    insert_at = start + 1
    for i in range(start + 1, end):
        if re.match(r"(?i)^DOMAIN\s*:", lines[i].strip()):
            insert_at = i + 1
            break
    lines.insert(insert_at, f"CATEGORY: {category}")
    return "\n".join(lines)


def extract_year(meta: Dict[str, str]) -> Optional[str]:
    y = meta.get("YEAR")
    if not y:
        return None
    y = y.strip()
    return y if re.fullmatch(r"\d{4}", y) else None


def build_target_filename(title: str, year: Optional[str], src: Path) -> str:
    base = slugify(title)
    if year:
        base = f"{base}-{year}"
    return base + src.suffix.lower()


@dataclass
class ImportResult:
    src: Path
    dst: Path
    domain: str
    status: str
    title: str
    year: Optional[str]


def import_md_files(
    out_dir: Path,
    content_dir: Path,
    mode: str = "copy",
) -> Tuple[int, int]:
    assert mode in {"copy", "move"}

    print("[scan] ignoring reports: out/reports/, _REPORT*, FORGE_REPORT*")

    def is_report_path(path: Path) -> bool:
        name = path.name.upper()
        if name.startswith("_REPORT"):
            return True
        if name.startswith("FORGE_REPORT"):
            return True
        return "reports" in {p.name.lower() for p in path.parents}

    md_files = sorted(p for p in out_dir.rglob("*.md") if not is_report_path(p))
    if not md_files:
        print(f"[import] No .md files found under: {out_dir}")
        return (0, 0)

    imported = 0
    skipped = 0

    for src in md_files:
        text = src.read_text(encoding="utf-8", errors="ignore")
        meta = parse_classification(text)

        domain = normalize_domain(meta.get("DOMAIN", src.parent.name))
        title = extract_title(meta, src.stem)
        category = meta.get("CATEGORY") or meta.get("PRIMARY CATEGORY") or default_category_for_domain(domain)
        status = normalize_status(meta.get("FORGE STATUS", ""))
        if status not in {"passed", "rejected"}:
            inferred = infer_status(text)
            if inferred:
                status = inferred
                print(f"[import] INFERRED status: {status} | {title} | {src}")
            else:
                skipped += 1
                print(f"[import] SKIP unknown status: {status} | {title} | {src}")
                continue
        year = extract_year(meta)

        target_name = build_target_filename(title, year, src)
        dst = content_dir / "forge" / domain / status / target_name
        dst.parent.mkdir(parents=True, exist_ok=True)

        # Remove stale copy in the opposite status folder to avoid conflicts.
        alt_status = "rejected" if status == "passed" else "passed"
        alt_dir = content_dir / "forge" / domain / alt_status
        if alt_dir.exists():
            for stale in alt_dir.glob(dst.stem + "*.md"):
                try:
                    stale.unlink()
                    print(f"[import] removed stale {alt_status}: {stale}")
                except OSError:
                    pass

        updated_text = ensure_title_in_classification(text, title)
        updated_text = ensure_category_in_classification(updated_text, category)
        if mode == "copy":
            if updated_text != text:
                dst.write_text(updated_text, encoding="utf-8")
            else:
                shutil.copy2(src, dst)
        else:
            if updated_text != text:
                dst.write_text(updated_text, encoding="utf-8")
                try:
                    src.unlink()
                except OSError:
                    pass
            else:
                shutil.move(str(src), str(dst))

        imported += 1

    print(f"[import] Imported: {imported} | Skipped (unknown/missing status): {skipped}")
    return (imported, skipped)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import Forge .md from out/ into content/forge/... folders"
    )
    parser.add_argument("--out", default="out", help="Source folder (default: out)")
    parser.add_argument(
        "--content", default="content", help="Destination content folder (default: content)"
    )
    parser.add_argument("--mode", choices=["copy", "move"], default="copy")
    args = parser.parse_args()

    out_dir = Path(args.out).resolve()
    content_dir = Path(args.content).resolve()

    if not out_dir.exists():
        raise SystemExit(f"[import] out folder not found: {out_dir}")

    import_md_files(out_dir=out_dir, content_dir=content_dir, mode=args.mode)


if __name__ == "__main__":
    main()
