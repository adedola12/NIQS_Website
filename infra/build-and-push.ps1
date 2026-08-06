<#
.SYNOPSIS
  Builds the NIQS API container image in CodeBuild and pushes it to ECR.

.DESCRIPTION
  The image is built in the cloud rather than on the workstation: Docker Desktop
  needs local administrator rights, which the deploying account does not have.
  This packages server/ as a zip, uploads it to the build/ prefix of the asset
  bucket, starts the niqs-api-build project, and waits for it.

  It deliberately stops at the image. Deploying it is a separate, riskier step,
  so the script prints the exact command rather than running it — see Step 4 of
  README.md.

  The zip is produced with `git archive`, so it contains committed, tracked files
  only. That keeps server/.env and the 47 MB of node_modules out of S3, and it
  means UNCOMMITTED WORK IS NOT INCLUDED. The script refuses to run on a dirty
  server/ tree rather than quietly shipping the previous commit.

.EXAMPLE
  Windows PowerShell 5.1 (what ships with Windows):
    powershell -ExecutionPolicy Bypass -File .\infra\build-and-push.ps1

  Pin the tag instead of taking the timestamp:
    pwsh infra/build-and-push.ps1 -ImageTag 2026-07-31-hotfix
#>
param(
  # NOT $Profile — that is an automatic variable in PowerShell holding the
  # profile script path, and shadowing it inside a script invites confusion.
  [string]$AwsProfile  = 'adlm-deploy',
  [string]$Region      = 'eu-west-3',
  [string]$ProjectName = 'niqs',

  # Dated and immutable. Express Mode redeploys only when ImageUri changes, so a
  # floating tag like :latest makes every subsequent deploy a silent no-op.
  [string]$ImageTag    = (Get-Date -Format 'yyyy-MM-dd-HHmm'),

  # Skip the clean-tree check. Only sensible when you know the difference is
  # confined to files the image does not use.
  [switch]$AllowDirty
)

$ErrorActionPreference = 'Stop'
$aws  = if (Get-Command aws -ErrorAction SilentlyContinue) { 'aws' } else { "$env:ProgramFiles\Amazon\AWSCLIV2\aws.exe" }
$repoRoot = Split-Path $PSScriptRoot -Parent

Push-Location $repoRoot
try {
  # ── The zip comes from HEAD, so anything uncommitted is invisible to it ────
  $dirty = & git status --porcelain -- server
  if ($dirty -and -not $AllowDirty) {
    Write-Host 'server/ has uncommitted changes:' -ForegroundColor Yellow
    $dirty | ForEach-Object { Write-Host "  $_" }
    throw 'the image is built from HEAD — commit these first, or pass -AllowDirty'
  }

  $sha = (& git rev-parse --short HEAD).Trim()
  Write-Host "building from $sha, tag $ImageTag"

  # ── Where the build project reads its source from ─────────────────────────
  $bucket = & $aws cloudformation list-exports `
      --region $Region --profile $AwsProfile `
      --query "Exports[?Name=='$ProjectName-asset-bucket'].Value" --output text
  if ($LASTEXITCODE -ne 0 -or -not $bucket -or $bucket -eq 'None') {
    throw "could not resolve the $ProjectName-asset-bucket export — is 01-foundation.yml deployed in $Region?"
  }

  $zip = Join-Path ([IO.Path]::GetTempPath()) "server-source-$ImageTag.zip"
  try {
    # HEAD:server puts the Dockerfile at the root of the zip, which is where the
    # buildspec's `docker build .` expects it.
    & git archive --format=zip --output $zip "HEAD:server"
    if ($LASTEXITCODE -ne 0) { throw 'git archive failed' }
    Write-Host ("packaged {0:N0} KB" -f ((Get-Item $zip).Length / 1KB))

    & $aws s3 cp $zip "s3://$bucket/build/server-source.zip" `
        --region $Region --profile $AwsProfile --only-show-errors
    if ($LASTEXITCODE -ne 0) { throw 's3 upload failed' }
  } finally {
    Remove-Item $zip -Force -ErrorAction SilentlyContinue
  }

  # ── Build ──────────────────────────────────────────────────────────────────
  $buildId = & $aws codebuild start-build `
      --project-name "$ProjectName-api-build" `
      --environment-variables-override "name=IMAGE_TAG,value=$ImageTag,type=PLAINTEXT" `
      --region $Region --profile $AwsProfile --query 'build.id' --output text
  if ($LASTEXITCODE -ne 0 -or -not $buildId) { throw 'start-build failed' }

  Write-Host "build $buildId started, waiting…"
  # The project's own TimeoutInMinutes is 20; stop watching a little after that
  # rather than polling forever if something upstream hangs.
  $deadline = (Get-Date).AddMinutes(22)
  do {
    Start-Sleep -Seconds 10
    $status = & $aws codebuild batch-get-builds --ids $buildId `
        --region $Region --profile $AwsProfile --query 'builds[0].buildStatus' --output text
    Write-Host "  $status"
    if ((Get-Date) -gt $deadline) { throw "gave up waiting on $buildId — check the CodeBuild console" }
  } while ($status -eq 'IN_PROGRESS')

  if ($status -ne 'SUCCEEDED') {
    throw "build $status — logs: aws logs tail /aws/codebuild/$ProjectName-api-build --profile $AwsProfile --region $Region"
  }

  $acct = & $aws sts get-caller-identity --query Account --output text --profile $AwsProfile
  $image = "$acct.dkr.ecr.$Region.amazonaws.com/$ProjectName-api:$ImageTag"

  Write-Host ''
  Write-Host "pushed $image" -ForegroundColor Green
  Write-Host ''
  Write-Host 'Next — check the current parameters, then deploy with that image:' -ForegroundColor Cyan
  Write-Host "  aws cloudformation describe-stacks --stack-name $ProjectName-api --region $Region --profile $AwsProfile --query `"Stacks[0].Parameters`" --output table"
  Write-Host ''
  Write-Host "  aws cloudformation deploy --template-file infra\cloudformation\02-service.yml ``"
  Write-Host "    --stack-name $ProjectName-api --region $Region --profile $AwsProfile ``"
  Write-Host "    --parameter-overrides ProjectName=$ProjectName ImageUri=$image ``"
  Write-Host "      ClientUrl=https://niqs-website.vercel.app,http://localhost:5173 ``"
  Write-Host "      IncludeStatsSecret=true IncludeOptionalSecrets=<as shown above>"
  Write-Host ''
  Write-Host 'IncludeStatsSecret=true requires NIQS_STATS_API_KEY to already be in the' -ForegroundColor Yellow
  Write-Host 'niqs/api secret. ECS will not start a task that references a key which is' -ForegroundColor Yellow
  Write-Host 'not there — it fails to launch rather than degrading. See README Step 2.'  -ForegroundColor Yellow
}
finally {
  Pop-Location
}
