import argparse
import re
from dataclasses import dataclass
from pathlib import Path


RE_STATUS = re.compile(r"(?m)^FORGE STATUS:\s*(PASSED|REJECTED)\b")
RE_CLASS = re.compile(r"(?m)^(##\s*)?CLASSIFICATION\b")
RE_DOMAIN = re.compile(r"(?m)^DOMAIN:\s*\w+")
RE_LEVEL = re.compile(r"(?m)^FORGE LEVEL:\s*(I|II|III|IV)\b")


@dataclass
class LintResult:
    path: Path
    error: str


def is_valid(text: str) -> tuple[bool, str]:
    if not RE_CLASS.search(text):
        return False, "missing CLASSIFICATION block"
    if not RE_DOMAIN.search(text):
        return False, "missing DOMAIN"
    if not RE_STATUS.search(text):
        return False, "missing FORGE STATUS"
    status = RE_STATUS.search(text).group(1)
    level_match = RE_LEVEL.search(text)
    level = level_match.group(1) if level_match else None
    if status == "PASSED":
        if not level:
            return False, "missing FORGE LEVEL"
        if level == "I":
            return False, "invalid: Level I cannot be PASSED"
    return True, ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Lint Forge outputs in out/**.md.")
    parser.add_argument("--out", default="out", help="Source folder (default: out)")
    args = parser.parse_args()

    out_dir = Path(args.out)
    if not out_dir.exists():
        raise SystemExit(f"[lint] out folder not found: {out_dir}")

    md_files = list(out_dir.rglob("*.md"))
    errors: list[LintResult] = []

    for fp in md_files:
        if fp.name.upper().startswith("_REPORT") or fp.name.upper().startswith("FORGE_REPORT"):
            continue
        if "reports" in {p.name.lower() for p in fp.parents}:
            continue
        text = fp.read_text(encoding="utf-8", errors="ignore")
        ok, reason = is_valid(text)
        if not ok:
            errors.append(LintResult(fp, reason))

    if errors:
        print(f"[lint] FAIL: {len(errors)} invalid files")
        for err in errors:
            print(f"[lint] {err.error}: {err.path}")
        raise SystemExit(1)

    print(f"[lint] OK: {len(md_files)} files scanned")


if __name__ == "__main__":
    main()
