$ErrorActionPreference = "Stop"

Write-Host "Step 1/4: run_forge.py"
python .\run_forge.py --prune-input --limit-by-domain "movies=30,others=25,books=10,persons=15"

Write-Host "Step 2/4: run_invocations.py"
python .\run_invocations.py

Write-Host "Step 3/4: import_from_out.py"
Push-Location .\site\forge
python .\scripts\import_from_out.py --out ..\..\out --content .\content --mode copy

Write-Host "Step 4/4: build_indexes.py"
python .\scripts\build_indexes.py
Pop-Location

Write-Host "Pipeline complete."
