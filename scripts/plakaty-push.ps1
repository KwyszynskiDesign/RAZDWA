#!/usr/bin/env pwsh
Set-Location "h:\RAZ DWA\RAZDWA"

# Build
npm run build

# Git operations
git add "docs/categories/plakaty-a4-a3.html" "docs/categories/plakaty.html" "data/normalized/plakaty.json"
git commit -m "chore: unify plakaty breakdown styles and extend discount tiers to 300szt"
git status --short
git stash
git pull --rebase origin main
git push origin main --force-with-lease
git stash pop 2>/dev/null | Out-Null
git --no-pager status --short
