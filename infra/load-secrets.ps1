<#
.SYNOPSIS
  Copies the API's runtime secrets from server/.env into AWS Secrets Manager.

.DESCRIPTION
  Run this yourself — the values are credentials and should not pass through a
  third party. It reads server/.env locally, builds the JSON document the ECS
  task expects, and writes it straight to the secret created by
  01-foundation.yml. Nothing is printed except key names.

  The service stack maps each key to an environment variable by name, so the
  key names here must match the Secrets block in 02-service.yml exactly.

.EXAMPLE
  Windows PowerShell 5.1 (what ships with Windows):
    powershell -ExecutionPolicy Bypass -File .\infra\load-secrets.ps1

  PowerShell 7, if installed:
    pwsh infra/load-secrets.ps1 -AwsProfile adlm-deploy -Region eu-west-3
#>
param(
  # NOT $Profile — that is an automatic variable in PowerShell holding the
  # profile script path, and shadowing it inside a script invites confusion.
  [string]$AwsProfile = 'adlm-deploy',
  [string]$Region     = 'eu-west-3',
  [string]$SecretId   = 'niqs/api',
  [string]$EnvFile    = "$PSScriptRoot\..\server\.env"
)

$ErrorActionPreference = 'Stop'
$aws = if (Get-Command aws -ErrorAction SilentlyContinue) { 'aws' } else { "$env:ProgramFiles\Amazon\AWSCLIV2\aws.exe" }

if (-not (Test-Path $EnvFile)) { throw "no .env at $EnvFile" }

# Keys the task definition consumes. JWT_SECRET must match what Render used, or
# every signed-in admin is logged out at cutover.
$KEYS = @(
  'MONGO_URI','JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET',
  'SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM',
  'PORTAL_API_URL','PORTAL_API_KEY',
  'NIQS_STATS_API_KEY'
)

$env_ = @{}
foreach ($line in Get-Content $EnvFile) {
  if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
  $k, $v = $line -split '=', 2
  $env_[$k.Trim()] = $v.Trim().Trim('"').Trim("'")
}

$payload = @{}
$found = @(); $missing = @()
foreach ($k in $KEYS) {
  if ($env_.ContainsKey($k) -and $env_[$k]) { $payload[$k] = $env_[$k]; $found += $k }
  else { $missing += $k }
}

Write-Host "found in .env : $($found -join ', ')"
if ($missing) { Write-Host "not set       : $($missing -join ', ')" -ForegroundColor Yellow }
if (-not $found) { throw 'nothing to upload' }

# Write via a temp file so the values never appear in a process argument list,
# where they would be visible to anything reading the process table.
$tmp = [IO.Path]::GetTempFileName()
try {
  $json = $payload | ConvertTo-Json -Compress
  # Written with an explicit BOM-less UTF-8 encoder rather than Set-Content.
  # Windows PowerShell 5.1's `-Encoding utf8` emits a BOM, and the three BOM
  # bytes land at the head of the file the CLI reads as JSON — the parse fails
  # with an error that says nothing about encoding.
  [IO.File]::WriteAllText($tmp, $json, (New-Object Text.UTF8Encoding $false))

  & $aws secretsmanager put-secret-value `
      --secret-id $SecretId `
      --secret-string "file://$tmp" `
      --region $Region --profile $AwsProfile --output json | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "put-secret-value failed ($LASTEXITCODE)" }
  Write-Host "uploaded $($found.Count) key(s) to $SecretId in $Region" -ForegroundColor Green
} finally {
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
}
