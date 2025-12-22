import os, re, time, json, requests, argparse
from pathlib import Path
from typing import Optional

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = "gpt-5.2"
REQUEST_TIMEOUTS = [(10, 120), (10, 240), (10, 420)]
MAX_RETRIES = 3
BACKOFF_SECONDS = [2, 5, 12]

CONFIG = {
    "movies": ("input/movies.txt", "prompts/movie_prompt.txt", "out/movies"),
    "books": ("input/books.txt", "prompts/book_prompt.txt", "out/books"),
    "persons": ("input/persons.txt", "prompts/person_prompt.txt", "out/persons"),
    "others": ("input/others.txt", "prompts/other_prompt.txt", "out/others"),
    "ideas": ("input/ideas.txt", "prompts/ideas_prompt.txt", "out/ideas"),
}

RE_STATUS = re.compile(r"(?m)^FORGE STATUS:\s*(PASSED|REJECTED)\b")
RE_CLASS = re.compile(r"(?m)^(##\s*)?CLASSIFICATION\b")
RE_DOMAIN = re.compile(r"(?m)^DOMAIN:\s*\w+")
RE_LEVEL = re.compile(r"(?m)^FORGE LEVEL:\s*(I|II|III|IV)\b")

def safe_name(s):
    return re.sub(r'[\\/*?:"<>|]', "_", s)[:80]

PROGRESS_LOG = Path("out/forge_progress.jsonl")

def load_progress() -> dict:
    if not PROGRESS_LOG.exists():
        return {}
    data = {}
    for line in PROGRESS_LOG.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        key = rec.get("key")
        subject = rec.get("subject")
        status = rec.get("status")
        if key and subject and status:
            data[(key, subject)] = status
    return data

def log_progress(key: str, subject: str, status: str, detail: str = "") -> None:
    PROGRESS_LOG.parent.mkdir(parents=True, exist_ok=True)
    rec = {"key": key, "subject": subject, "status": status}
    if detail:
        rec["detail"] = detail
    with PROGRESS_LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

def read_text_fallback(path):
    try:
        return Path(path).read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return Path(path).read_text(encoding="cp1252")

def call_agent(prompt, subject: Optional[str], outfile: Path, domain: str):
    if subject is None:
        full = prompt
    else:
        full = f"{prompt}\n\nSUBJECT:\n{subject}"
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            partial = outfile.with_suffix(outfile.suffix + ".partial")
            with requests.post(
                "https://api.openai.com/v1/responses",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={"model": MODEL, "input": full, "stream": True},
                stream=True,
                timeout=REQUEST_TIMEOUTS[attempt - 1]
            ) as r:
                r.raise_for_status()
                output = []
                with partial.open("w", encoding="utf-8") as f:
                    for line in r.iter_lines(decode_unicode=True):
                        if not line:
                            continue
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                payload = json.loads(data_str)
                            except json.JSONDecodeError:
                                continue
                            if payload.get("type") == "response.output_text.delta":
                                delta = payload.get("delta", "")
                                if delta:
                                    f.write(delta)
                                    f.flush()
                                    output.append(delta)
                            elif payload.get("type") == "response.output_text.done":
                                done_text = payload.get("text", "")
                                if done_text and not output:
                                    f.write(done_text)
                                    f.flush()
                                    output.append(done_text)
                partial.replace(outfile)
                return "".join(output).strip()
        except requests.exceptions.HTTPError as e:
            status = e.response.status_code if e.response is not None else None
            retryable = status in (429, 500, 502, 503, 504)
            if attempt < MAX_RETRIES and retryable:
                reason = f"HTTP {status}" if status else "HTTP error"
                print(f"[{domain}] retry ({attempt + 1}/{MAX_RETRIES}): {subject} - {reason}")
                time.sleep(BACKOFF_SECONDS[attempt - 1])
                continue
            raise
        except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
            if attempt < MAX_RETRIES:
                reason = "timeout" if isinstance(e, requests.exceptions.ReadTimeout) else "connection"
                print(f"[{domain}] retry ({attempt + 1}/{MAX_RETRIES}): {subject} - {reason}")
                time.sleep(BACKOFF_SECONDS[attempt - 1])
                continue
            raise
    return ""

def extract_status_level(text: str) -> tuple[Optional[str], Optional[str]]:
    status_match = RE_STATUS.search(text)
    level_match = RE_LEVEL.search(text)
    status = status_match.group(1) if status_match else None
    level = level_match.group(1) if level_match else None
    return status, level


def is_valid_forge_output(text: str) -> bool:
    if not text:
        return False
    if not (RE_CLASS.search(text) and RE_DOMAIN.search(text) and RE_LEVEL.search(text)):
        return False
    status, level = extract_status_level(text)
    if not status or not level:
        return False
    if level == "I" and status == "PASSED":
        return False
    return True


def build_repair_prompt() -> str:
    return (
        "You violated the output contract.\n"
        "Rewrite the SAME content but ensure the following lines exist EXACTLY:\n"
        "CLASSIFICATION section including:\n"
        "DOMAIN:\n"
        "FORGE LEVEL: I | II | III | IV\n"
        "FORGE STATUS: PASSED or REJECTED\n"
        "If FORGE LEVEL is I, FORGE STATUS must be REJECTED.\n"
        "Do not add meta commentary. Output the full corrected document.\n"
    )


def parse_classification(md_text: str) -> dict:
    if "CLASSIFICATION" not in md_text:
        return {}
    block = md_text.split("CLASSIFICATION", 1)[1]
    lines = [l.strip() for l in block.splitlines() if l.strip()]
    data = {}
    for line in lines:
        if ":" in line:
            k, v = line.split(":", 1)
            data[k.strip().upper()] = v.strip()
    return data


from collections import defaultdict
from pathlib import Path

out_root = Path("out")
reports_root = out_root / "reports"

def is_report_path(path: Path) -> bool:
    name = path.name.upper()
    if name.startswith("_REPORT"):
        return True
    # Also ignore legacy report filenames in out/ root.
    if name.startswith("FORGE_REPORT"):
        return True
    # Ignore anything under out/reports/.
    return "reports" in {p.name.lower() for p in path.parents}


def build_report() -> str:
    md_files = [p for p in out_root.rglob("*.md") if not is_report_path(p)]

    totals = {"PASSED": 0, "REJECTED": 0}
    by_domain = defaultdict(lambda: {"TOTAL": 0, "PASSED": 0, "REJECTED": 0})
    by_level = defaultdict(int)
    by_category = defaultdict(int)

    # Listagens (para "quais estao onde")
    passed_items = []
    rejected_items = []

    by_domain_items = defaultdict(lambda: {"PASSED": [], "REJECTED": []})

    by_level_passed = defaultdict(int)
    by_level_rejected = defaultdict(int)

    for fp in md_files:
        text = fp.read_text(encoding="utf-8", errors="ignore")
        meta = parse_classification(text)
        if not meta:
            continue

        domain = meta.get("DOMAIN", "Unknown")
        status = meta.get("FORGE STATUS", "Unknown").upper()
        level = meta.get("FORGE LEVEL", "Unknown")

        category = (
            meta.get("CATEGORY")
            or meta.get("PRIMARY CATEGORY")
            or "Unclassified"
        )

        # Nome "humano" do item (primeiro tenta TITLE/NAME/SUBJECT, senao filename)
        display_name = (
            meta.get("TITLE")
            or meta.get("NAME")
            or meta.get("SUBJECT")
            or fp.stem
        ).strip()

        entry = f"{display_name}  ({fp.as_posix()})"

        if status == "PASSED":
            passed_items.append(entry)
            by_domain_items[domain]["PASSED"].append(entry)
            by_level_passed[level] += 1
        elif status == "REJECTED":
            rejected_items.append(entry)
            by_domain_items[domain]["REJECTED"].append(entry)
            by_level_rejected[level] += 1

        by_domain[domain]["TOTAL"] += 1
        if status in totals:
            totals[status] += 1
            by_domain[domain][status] += 1

        by_level[level] += 1
        by_category[category] += 1

    report = []
    report.append("# THE FORGE - Batch Report\n\n")
    report.append(f"Total entries: **{sum(totals.values())}**\n")
    report.append(f"- ? PASSED: **{totals['PASSED']}**\n")
    report.append(f"- ? REJECTED: **{totals['REJECTED']}**\n\n")

    report.append("## By Domain\n")
    for domain, stats in by_domain.items():
        report.append(
            f"- **{domain}** - total {stats['TOTAL']} | "
            f"? {stats['PASSED']} | ? {stats['REJECTED']}\n"
        )

    report.append("\n## Forge Levels - PASSED only\n")
    for level, count in sorted(by_level_passed.items(), key=lambda x: x[1], reverse=True):
        report.append(f"- **{level}**: {count}\n")

    report.append("\n## Forge Levels - REJECTED only\n")
    for level, count in sorted(by_level_rejected.items(), key=lambda x: x[1], reverse=True):
        report.append(f"- **{level}**: {count}\n")

    report.append("\n## Top Categories\n")
    for cat, count in sorted(by_category.items(), key=lambda x: x[1], reverse=True)[:12]:
        report.append(f"- **{cat}**: {count}\n")

    # Listagens finais
    report.append("\n## PASSED - Items\n")
    if passed_items:
        for e in sorted(passed_items):
            report.append(f"- ? {e}\n")
    else:
        report.append("- (none)\n")

    report.append("\n## REJECTED - Items\n")
    if rejected_items:
        for e in sorted(rejected_items):
            report.append(f"- ? {e}\n")
    else:
        report.append("- (none)\n")

    report.append("\n## By Domain - Item Lists\n")
    for domain, items in by_domain_items.items():
        report.append(f"\n### {domain}\n")
        report.append("**PASSED**\n")
        if items["PASSED"]:
            for e in sorted(items["PASSED"]):
                report.append(f"- ? {e}\n")
        else:
            report.append("- (none)\n")

        report.append("\n**REJECTED**\n")
        if items["REJECTED"]:
            for e in sorted(items["REJECTED"]):
                report.append(f"- ? {e}\n")
        else:
            report.append("- (none)\n")

    return "".join(report)


def write_report(final: bool) -> None:
    report_text = build_report()
    reports_root.mkdir(parents=True, exist_ok=True)
    (reports_root / "_REPORT.partial.md").write_text(report_text, encoding="utf-8")
    if final:
        (reports_root / "_REPORT.md").write_text(report_text, encoding="utf-8")
        print("Report written: out/reports/_REPORT.md")


def parse_domain_limits(raw: str) -> dict:
    if not raw:
        return {}
    out = {}
    for part in raw.split(","):
        part = part.strip()
        if not part or "=" not in part:
            continue
        key, val = part.split("=", 1)
        key = key.strip().lower()
        try:
            out[key] = max(0, int(val.strip()))
        except ValueError:
            continue
    return out


def run_forge(prune_input: bool, limit_per_domain: int, limit_by_domain: dict) -> None:
    # Precompute how many items we intend to process for progress display.
    domain_targets = {}
    total_target = 0
    for key, (input_file, _prompt_file, _out_dir) in CONFIG.items():
        input_path = Path(input_file)
        if not input_path.exists():
            domain_targets[key] = 0
            continue
        raw_subjects = read_text_fallback(input_file).splitlines()
        subjects = [s.strip() for s in raw_subjects if s.strip()]
        domain_limit = limit_by_domain.get(key, limit_per_domain)
        target = min(len(subjects), domain_limit) if domain_limit > 0 else len(subjects)
        domain_targets[key] = target
        total_target += target

    processed_global = 0

    def progress_label(domain_count: int, domain_target: int) -> str:
        if total_target > 0 and domain_target > 0:
            return f"({processed_global}/{total_target}, {domain_count}/{domain_target})"
        if total_target > 0:
            return f"({processed_global}/{total_target})"
        return ""

    for key, (input_file, prompt_file, out_dir) in CONFIG.items():
        Path(out_dir).mkdir(parents=True, exist_ok=True)
        input_path = Path(input_file)
        if not input_path.exists():
            continue

        progress = load_progress()
        prompt = read_text_fallback(prompt_file)
        raw_subjects = read_text_fallback(input_file).splitlines()
        subjects = [s.strip() for s in raw_subjects]

        remaining = []

        count = 0
        domain_target = domain_targets.get(key, 0)
        domain_limit = limit_by_domain.get(key, limit_per_domain)

        for s in subjects:
            if not s:
                continue

            if domain_limit > 0 and count >= domain_limit:
                remaining.append(s)
                continue

            outfile = Path(out_dir) / f"{safe_name(s)}.md"
            if progress.get((key, s)) == "ok":
                processed_global += 1
                count += 1
                print(f"[{key}] skip {progress_label(count, domain_target)}: {s} - already ok")
                if prune_input:
                    continue
                remaining.append(s)
                continue
            if outfile.exists():
                log_progress(key, s, "ok", "exists")
                processed_global += 1
                count += 1
                print(f"[{key}] skip {progress_label(count, domain_target)}: {s} - exists")
                if prune_input:
                    continue
                remaining.append(s)
                continue

            processed_global += 1
            count += 1
            print(f"[{key}] forging {progress_label(count, domain_target)}: {s}")
            try:
                text = call_agent(prompt, s, outfile, key)
                if not is_valid_forge_output(text):
                    repair_prompt = build_repair_prompt()
                    repaired = text
                    for attempt in range(1, 4):
                        temp_out = outfile.with_suffix(outfile.suffix + f".repair{attempt}")
                        repaired = call_agent(
                            repair_prompt + "\n\n" + repaired,
                            None,
                            temp_out,
                            key,
                        )
                        if is_valid_forge_output(repaired):
                            text = repaired
                            break
                    if not is_valid_forge_output(text):
                        invalid_path = outfile.with_suffix(".INVALID.md")
                        invalid_path.write_text(repaired or text or "", encoding="utf-8")
                        print(
                            f"[{key}] fail {progress_label(count, domain_target)}: "
                            f"{s} (invalid output)"
                        )
                        log_progress(key, s, "fail", "invalid output")
                        write_report(final=False)
                        remaining.append(s)
                        continue
                if not outfile.exists():
                    outfile.write_text(text, encoding="utf-8")
                log_progress(key, s, "ok")
                write_report(final=False)
                print(f"[{key}] done {progress_label(count, domain_target)}: {s}")
                if prune_input:
                    continue
                remaining.append(s)
            except requests.exceptions.RequestException as e:
                print(f"[{key}] fail {progress_label(count, domain_target)}: {s} ({e})")
                log_progress(key, s, "fail", str(e))
                write_report(final=False)
                remaining.append(s)
                continue

        if prune_input:
            backup = input_path.with_suffix(input_path.suffix + ".bak")
            backup.write_text("\n".join(subjects) + "\n", encoding="utf-8")
            input_path.write_text("\n".join(remaining) + ("\n" if remaining else ""), encoding="utf-8")

    print("FORGE COMPLETE.")
    write_report(final=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Forge generation pipeline.")
    parser.add_argument(
        "--prune-input",
        action="store_true",
        help="Remove subjects from input/*.txt after output is ready.",
    )
    parser.add_argument(
        "--limit-per-domain",
        type=int,
        default=0,
        help="Limit number of subjects processed per domain (0 = no limit).",
    )
    parser.add_argument(
        "--limit-by-domain",
        default="",
        help="Per-domain limits: movies=30,others=25,books=10,persons=15",
    )
    args = parser.parse_args()
    limits = parse_domain_limits(args.limit_by_domain)
    run_forge(
        prune_input=args.prune_input,
        limit_per_domain=args.limit_per_domain,
        limit_by_domain=limits,
    )


if __name__ == "__main__":
    main()
