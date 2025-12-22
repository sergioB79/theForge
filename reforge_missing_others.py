import argparse
import re
from pathlib import Path

import run_forge


def missing_or_invalid(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="ignore")
    return not run_forge.is_valid_forge_output(text)


def subject_from_path(path: Path) -> str:
    # safe_name keeps spaces; only replaces invalid chars with "_"
    return path.stem


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Re-forge Others entries missing FORGE STATUS."
    )
    parser.add_argument("--limit", type=int, default=0, help="Max items to reforge.")
    args = parser.parse_args()

    out_dir = Path("out") / "others"
    if not out_dir.exists():
        raise SystemExit(f"[reforge] out/others not found: {out_dir}")

    prompt = run_forge.read_text_fallback("prompts/other_prompt.txt")

    candidates = [p for p in out_dir.glob("*.md") if missing_or_invalid(p)]
    if args.limit > 0:
        candidates = candidates[: args.limit]

    print(f"[reforge] candidates: {len(candidates)}")
    for idx, path in enumerate(candidates, start=1):
        subject = subject_from_path(path)
        outfile = path
        print(f"[reforge] ({idx}/{len(candidates)}): {subject}")

        text = run_forge.call_agent(prompt, subject, outfile, "others")
        if not run_forge.is_valid_forge_output(text):
            repair_prompt = run_forge.build_repair_prompt()
            repaired = text
            for attempt in range(1, 4):
                temp_out = outfile.with_suffix(outfile.suffix + f".repair{attempt}")
                repaired = run_forge.call_agent(
                    repair_prompt + "\n\n" + repaired,
                    None,
                    temp_out,
                    "others",
                )
                if run_forge.is_valid_forge_output(repaired):
                    text = repaired
                    break
            if not run_forge.is_valid_forge_output(text):
                invalid_path = outfile.with_suffix(".INVALID.md")
                invalid_path.write_text(repaired or text or "", encoding="utf-8")
                print(f"[reforge] invalid output: {subject} -> {invalid_path}")
                continue

        outfile.write_text(text, encoding="utf-8")
        print(f"[reforge] ok: {subject}")


if __name__ == "__main__":
    main()
