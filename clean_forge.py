from __future__ import annotations

import argparse
import shutil
from pathlib import Path


def remove_path(path: Path, dry_run: bool) -> None:
    if not path.exists():
        return
    if dry_run:
        print(f"[dry-run] remove: {path}")
        return
    if path.is_dir():
        shutil.rmtree(path)
    else:
        path.unlink()


def remove_glob(root: Path, pattern: str, dry_run: bool) -> None:
    for path in root.glob(pattern):
        remove_path(path, dry_run)


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean Forge outputs to a virgin state.")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be deleted.")
    args = parser.parse_args()

    root = Path(".").resolve()

    # out/
    remove_glob(root / "out", "**/*.md", args.dry_run)
    remove_glob(root / "out", "**/*.partial", args.dry_run)
    remove_glob(root / "out" / "reports", "_REPORT*.md", args.dry_run)
    remove_glob(root / "out", "FORGE_REPORT*.md", args.dry_run)
    remove_path(root / "out" / "forge_progress.jsonl", args.dry_run)

    # site content + data + cache
    remove_path(root / "site" / "forge" / "content" / "forge", args.dry_run)
    remove_glob(root / "site" / "forge" / "data", "*.json", args.dry_run)
    remove_path(root / "site" / "forge" / ".next", args.dry_run)

    # Recreate empty content/forge folder if removed.
    if not args.dry_run:
        (root / "site" / "forge" / "content" / "forge").mkdir(parents=True, exist_ok=True)

    print("[clean] complete")


if __name__ == "__main__":
    main()
