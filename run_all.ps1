param(
  [string]$LimitByDomain = "movies=30,others=25,books=10,persons=15,ideas=0"
)

$ErrorActionPreference = "Stop"

function Step($label, $command) {
  Write-Host ""
  Write-Host $label
  $start = Get-Date
  & $command
  $elapsed = (Get-Date) - $start
  Write-Host ("Done in {0:N1}s" -f $elapsed.TotalSeconds)
}

Step "Step 1/3: run_forge.py" { python .\run_forge.py --prune-input --limit-by-domain $LimitByDomain }
Step "Step 2/3: lint_forge.py" { python .\lint_forge.py }
Step "Step 3/3: import + indexes" {
  python .\site\forge\scripts\import_from_out.py --out .\out --content .\site\forge\content --mode copy
  Push-Location .\site\forge
  try {
    python .\scripts\build_indexes.py
  } finally {
    Pop-Location
  }
}

Write-Host ""
Write-Host "Pipeline complete."
