$ErrorActionPreference = "Stop"

# Paths
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $root
$frontend = Join-Path $projectRoot "frontend"
$deployRoot = Join-Path $projectRoot "app/DEPLOY"
$deployPublic = Join-Path $deployRoot "public_html"
$deployNode = Join-Path $deployRoot "nodeapps/markaztech"

Write-Host "== Cleaning previous deploy outputs and archives =="
if (Test-Path $deployRoot) { Remove-Item -Recurse -Force $deployRoot }
Get-ChildItem $projectRoot -Recurse -Include *.zip,*.rar,*.7z -ErrorAction SilentlyContinue | Remove-Item -Force

Write-Host "== Cleaning frontend build artifacts =="
Remove-Item -Recurse -Force "$frontend/.next","$frontend/out" -ErrorAction SilentlyContinue

Write-Host "== Installing frontend dependencies =="
Push-Location $frontend
npm install
Write-Host "== Building frontend (standalone) =="
npm run build
Pop-Location

Write-Host "== Preparing deploy directories =="
New-Item -ItemType Directory -Force -Path $deployPublic | Out-Null
New-Item -ItemType Directory -Force -Path $deployNode | Out-Null

Write-Host "== Copying backend to DEPLOY/public_html/api =="
Copy-Item -Recurse -Force "$projectRoot/app/public_html/api" $deployPublic
Copy-Item -Force "$projectRoot/app/public_html/.htaccess" "$deployPublic/.htaccess"

# Remove secrets and unwanted files
Remove-Item -Force "$deployPublic/api/.env" -ErrorAction SilentlyContinue
Remove-Item -Force "$deployPublic/api/.env.development" -ErrorAction SilentlyContinue
Remove-Item -Force "$deployPublic/api/db.sqlite3" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$deployPublic/api/staticfiles" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$deployPublic/api/logs" -ErrorAction SilentlyContinue

Write-Host "== Copying frontend standalone to DEPLOY/nodeapps/markaztech =="
Copy-Item -Recurse -Force "$frontend/.next/standalone/*" $deployNode
Copy-Item -Recurse -Force "$frontend/.next/static" "$deployNode/.next/"
Copy-Item -Recurse -Force "$frontend/public" $deployNode
Remove-Item -Recurse -Force "$deployNode/node_modules" -ErrorAction SilentlyContinue

Write-Host "== Done. You can zip:"
Write-Host "   public_html -> $deployPublic"
Write-Host "   node app    -> $deployNode"
