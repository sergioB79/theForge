# THE FORGE

## Deploy Notes (Vercel)

The site serves whatever is committed in the repo at build time.

Required generated files to commit:
- `site/forge/content/forge/**`
- `site/forge/data/forge_index.json`
- `site/forge/data/archive_index.json`
- `site/forge/data/stats.json`

Everything in `out/` stays local.

## Update Content Checklist

1) Run the pipeline locally (example):
   `.\run_all.ps1 -LimitByDomain "movies=12,others=12,books=12,persons=12,ideas=12"`
2) Import + rebuild indexes (if not already in your pipeline):
   `python .\site\forge\scripts\import_from_out.py --out .\out --content .\site\forge\content --mode copy`
   `Push-Location .\site\forge; python .\scripts\build_indexes.py; Pop-Location`
3) Commit generated outputs:
   - `site/forge/content/forge/**`
   - `site/forge/data/forge_index.json`
   - `site/forge/data/archive_index.json`
   - `site/forge/data/stats.json`
4) Push to GitHub; Vercel deploys from `main`.
