from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


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
    d = (domain or "").strip().lower()
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
    s = (status or "").strip().upper()
    if "PASS" in s:
        return "PASSED"
    if "REJECT" in s:
        return "REJECTED"
    return "UNKNOWN"


def is_valid_person_status(raw_status: str) -> bool:
    s = (raw_status or "").strip().upper()
    s = re.sub(r"[\u2013\u2014\?]", "-", s)
    s = re.sub(r"\s*-\s*", " - ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s in {"PASSED", "PASSED - CONSTRUCTIVE", "PASSED - PATHOLOGICAL", "REJECTED"}


def normalize_level(level: str) -> str:
    l = (level or "").strip().upper()
    if l in {"I", "II", "III", "IV"}:
        return l
    m = re.search(r"\b(I{1,3}|IV)\b", l)
    return m.group(1) if m else "II"


def split_tags(tags: str) -> List[str]:
    if not tags:
        return []
    raw = re.split(r"[;,|]", tags)
    cleaned: List[str] = []
    for t in raw:
        x = t.strip().lower()
        x = re.sub(r"\s+", " ", x)
        if x:
            cleaned.append(x)
    seen = set()
    out = []
    for t in cleaned:
        if t not in seen:
            out.append(t)
            seen.add(t)
    return out


def normalize_tag_list(raw_tags: List[str]) -> List[str]:
    cleaned: List[str] = []
    for t in raw_tags:
        x = t.strip().lower()
        if not x:
            continue
        x = re.sub(r"[\"'`]", "", x)
        x = re.sub(r"\s+", " ", x)
        x = x.replace(" ", "-")
        x = re.sub(r"[^a-z0-9-]+", "-", x)
        x = re.sub(r"-{2,}", "-", x).strip("-")
        if x:
            cleaned.append(x)
    seen = set()
    out: List[str] = []
    for t in cleaned:
        if t not in seen:
            out.append(t)
            seen.add(t)
    return out


def extract_tags_from_body(md_text: str) -> List[str]:
    lines = md_text.splitlines()
    start = None
    tag_header = re.compile(r"(?i)^[#>\-\s]*TAGS\b")
    bullet = re.compile(r"^\s*[-*+]\s+(.+)$")
    for i, raw in enumerate(lines):
        if tag_header.match(raw.strip()):
            start = i + 1
            break
    if start is None:
        return []
    tags: List[str] = []
    for i in range(start, len(lines)):
        line = lines[i].strip()
        if not line:
            if tags:
                break
            continue
        if tag_header.match(line):
            continue
        m = bullet.match(line)
        if m:
            tags.append(m.group(1))
            continue
        if tags:
            break
        if re.match(r"^[A-Z0-9][A-Z0-9\s\-–—()]+$", line):
            break
    return normalize_tag_list(tags)


def level_to_heat(level: str) -> float:
    return {"IV": 1.00, "III": 0.72, "II": 0.48, "I": 0.32}.get(level, 0.48)


def safe_get_title(meta: Dict[str, str], fallback: str) -> str:
    return (meta.get("TITLE") or meta.get("SUBJECT") or meta.get("NAME") or fallback).strip()


def normalize_other_title(title: str) -> str:
    cleaned = re.sub(r"\s*\([^)]*\)\s*$", "", title).strip()
    return cleaned or title


def safe_year(meta: Dict[str, str]) -> Optional[int]:
    y = (meta.get("YEAR") or "").strip()
    return int(y) if re.fullmatch(r"\d{4}", y) else None


def safe_country(meta: Dict[str, str]) -> Optional[str]:
    c = (meta.get("COUNTRY") or "").strip()
    return c or None


def safe_creator(meta: Dict[str, str]) -> Optional[str]:
    return (meta.get("DIRECTOR") or meta.get("AUTHOR") or "").strip() or None


def safe_category(meta: Dict[str, str]) -> str:
    return (meta.get("CATEGORY") or meta.get("PRIMARY CATEGORY") or "Unclassified").strip()


def safe_subtitle(meta: Dict[str, str]) -> Optional[str]:
    subtitle = (meta.get("SUBTITLE") or "").strip()
    return subtitle or None


def md_to_url(domain: str, slug: str) -> str:
    return f"/forge/{domain}/{slug}"


@dataclass
class Item:
    id: str
    domain: str
    title: str
    slug: str
    status: str
    level: str
    category: str
    subtitle: Optional[str]
    tags: List[str]
    year: Optional[int]
    country: Optional[str]
    creator: Optional[str]
    sourcePath: str
    url: str
    heat: float


def build_edges(items: List[Item], max_edges_per_item: int = 6) -> Dict[str, List[dict]]:
    tag_map: Dict[str, List[int]] = defaultdict(list)
    for i, it in enumerate(items):
        for t in it.tags:
            tag_map[t].append(i)

    edges: Dict[str, List[dict]] = {}

    for i, it in enumerate(items):
        candidates = Counter()
        it_tags = set(it.tags)
        if not it_tags:
            edges[it.id] = []
            continue

        for t in it.tags:
            for j in tag_map.get(t, []):
                if j != i:
                    candidates[j] += 1

        scored = []
        for j, shared_count in candidates.items():
            other = items[j]
            other_tags = set(other.tags)
            union = len(it_tags | other_tags)
            if union == 0:
                continue
            overlap = shared_count / union
            score = overlap * (0.85 + 0.15 * (it.heat + other.heat) / 2.0)
            if score <= 0:
                continue

            shared_tags = sorted(list(it_tags & other_tags))[:8]
            scored.append((score, other.id, shared_tags))

        scored.sort(reverse=True, key=lambda x: x[0])
        edges[it.id] = [
            {"to": oid, "weight": round(score, 4), "sharedTags": shared}
            for score, oid, shared in scored[:max_edges_per_item]
        ]

    return edges


def has_invocation_block(md_text: str) -> bool:
    return re.search(r"(?m)^\s*INVOCATION\s*$", md_text) is not None


def main() -> None:
    root = Path(".").resolve()
    print("[scan] ignoring reports: out/reports/, _REPORT*, FORGE_REPORT*")
    content_root = root / "content" / "forge"
    data_root = root / "data"
    data_root.mkdir(parents=True, exist_ok=True)

    if not content_root.exists():
        raise SystemExit(f"[indexes] content/forge folder not found: {content_root}")

    md_files = sorted(content_root.rglob("*.md"))
    if not md_files:
        raise SystemExit("[indexes] No markdown files found under content/forge/**")

    passed: List[Item] = []
    rejected: List[Item] = []

    stats_domain = Counter()
    stats_status = Counter()
    stats_level = Counter()
    stats_category = Counter()
    stats_tag = Counter()
    best_by_key: Dict[tuple, tuple[Item, float, bool]] = {}
    best_by_title: Dict[tuple, tuple[Item, float, bool]] = {}
    duplicates_found = 0
    status_conflicts_found = 0

    for fp in md_files:
        text = fp.read_text(encoding="utf-8", errors="ignore")
        meta = parse_classification(text)
        if not meta:
            continue

        domain = normalize_domain(meta.get("DOMAIN", fp.parents[2].name if len(fp.parents) >= 3 else "others"))
        raw_status = meta.get("FORGE STATUS", "")
        status = normalize_status(raw_status)
        level = normalize_level(meta.get("FORGE LEVEL", "II"))
        category = safe_category(meta)
        subtitle = safe_subtitle(meta)
        title = safe_get_title(meta, fp.stem)
        if domain == "others":
            title = normalize_other_title(title)
        year = safe_year(meta)
        country = safe_country(meta)
        creator = safe_creator(meta)

        tags = split_tags(meta.get("TAGS", ""))
        if not tags:
            tags = extract_tags_from_body(text)

        if domain == "persons" and not is_valid_person_status(raw_status):
            print(f"[indexes] skip invalid person status: {fp}")
            continue

        if status == "PASSED" and level == "I":
            print(f"[indexes] skip invalid level/status (I cannot pass): {fp}")
            continue

        slug = slugify(f"{title}-{year}" if year else title)
        iid = slug

        try:
            source_path = fp.relative_to(root).as_posix()
        except ValueError:
            source_path = fp.as_posix()
        url = md_to_url(domain, slug)
        heat = level_to_heat(level)

        item = Item(
            id=iid,
            domain=domain,
            title=title,
            slug=slug,
            status=status,
            level=level,
            category=category,
            subtitle=subtitle,
            tags=tags,
            year=year,
            country=country,
            creator=creator,
            sourcePath=source_path,
            url=url,
            heat=heat,
        )
        key = (status, slug)
        title_key = (domain, title.strip().lower())
        has_invocation = has_invocation_block(text)
        mtime = fp.stat().st_mtime

        current = best_by_key.get(key)
        if current is None:
            best_by_key[key] = (item, mtime, has_invocation)
        else:
            _, current_mtime, current_invocation = current
            if has_invocation and not current_invocation:
                best_by_key[key] = (item, mtime, has_invocation)
            elif has_invocation == current_invocation and mtime > current_mtime:
                best_by_key[key] = (item, mtime, has_invocation)

        current_title = best_by_title.get(title_key)
        if current_title is None:
            best_by_title[title_key] = (item, mtime, has_invocation)
        else:
            current_item, current_mtime, current_invocation = current_title
            if current_item.status != item.status:
                status_conflicts_found += 1
                print(
                    f"[indexes] STATUS CONFLICT: {title} ({current_item.status} vs {item.status})"
                )
                if has_invocation and not current_invocation:
                    best_by_title[title_key] = (item, mtime, has_invocation)
                elif has_invocation == current_invocation and mtime > current_mtime:
                    best_by_title[title_key] = (item, mtime, has_invocation)
            else:
                duplicates_found += 1
                if has_invocation and not current_invocation:
                    print(f"[indexes] duplicate title kept (invocation wins): {fp}")
                    best_by_title[title_key] = (item, mtime, has_invocation)
                elif has_invocation == current_invocation and mtime > current_mtime:
                    print(f"[indexes] duplicate title kept (newer wins): {fp}")
                    best_by_title[title_key] = (item, mtime, has_invocation)

    for item, _, _ in best_by_key.values():
        stats_domain[item.domain] += 1
        stats_status[item.status] += 1
        stats_level[item.level] += 1
        stats_category[item.category] += 1
        for t in item.tags:
            stats_tag[t] += 1

        if item.status == "PASSED":
            passed.append(item)
        elif item.status == "REJECTED":
            rejected.append(item)

    edges = build_edges(passed, max_edges_per_item=6)

    forge_index = {
        "generated_at": iso_now(),
        "count": len(passed),
        "items": [
            {
                "id": it.id,
                "domain": it.domain,
                "title": it.title,
                "slug": it.slug,
                "status": it.status,
                "year": it.year,
                "country": it.country,
                "creator": it.creator,
                "category": it.category,
                "subtitle": it.subtitle,
                "level": it.level,
                "tags": it.tags,
                "sourcePath": it.sourcePath,
                "url": it.url,
                "heat": it.heat,
                "edges": edges.get(it.id, []),
            }
            for it in passed
        ],
    }

    archive_index = {
        "generated_at": iso_now(),
        "count": len(rejected),
        "items": [
            {
                "id": it.id,
                "domain": it.domain,
                "title": it.title,
                "slug": it.slug,
                "status": it.status,
                "year": it.year,
                "country": it.country,
                "creator": it.creator,
                "category": it.category,
                "subtitle": it.subtitle,
                "level": it.level,
                "tags": it.tags,
                "sourcePath": it.sourcePath,
                "url": it.url,
                "heat": it.heat,
            }
            for it in rejected
        ],
    }

    stats = {
        "generated_at": iso_now(),
        "totals": {
            "all": len(passed) + len(rejected),
            "passed": len(passed),
            "rejected": len(rejected),
        },
        "by_domain": dict(stats_domain),
        "by_status": dict(stats_status),
        "by_level": dict(stats_level),
        "top_categories": stats_category.most_common(25),
        "top_tags": stats_tag.most_common(50),
    }

    (data_root / "forge_index.json").write_text(
        json.dumps(forge_index, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (data_root / "archive_index.json").write_text(
        json.dumps(archive_index, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (data_root / "stats.json").write_text(
        json.dumps(stats, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(f"[indexes] PASSED: {len(passed)} -> data/forge_index.json")
    print(f"[indexes] REJECTED: {len(rejected)} -> data/archive_index.json")
    print("[indexes] Stats -> data/stats.json")
    if duplicates_found > 0:
        print(f"[indexes] DUPLICATES DETECTED: {duplicates_found} (review recommended)")
    if status_conflicts_found > 0:
        print(f"[indexes] STATUS CONFLICTS DETECTED: {status_conflicts_found} (review recommended)")


if __name__ == "__main__":
    main()
