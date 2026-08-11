<#
.SYNOPSIS
  Uploads client/dist to the Apache host over FTPS.

.DESCRIPTION
  The domain is not connected to automatic deployment -- every release reaches
  niqs.org.ng as a manual upload. This script exists because the manual step has
  a way of going wrong in the same two places every time:

    1. .htaccess is a dot-file. FileZilla, WinSCP and the cPanel File Manager all
       hide dot-files by default, so the one file that makes deep links work gets
       left behind and every URL except the homepage returns 404. That is exactly
       what happened between 6 and 11 August. This script uploads it explicitly.

    2. Nobody can tell afterwards whether the upload finished. It prints a count
       and fails loudly rather than skipping a file quietly.

  Your password is never stored, never written to disk, and never passed on the
  command line where it would land in your shell history. It is read into a
  SecureString at the prompt, or taken from the NIQS_FTP_PASSWORD environment
  variable if you would rather set it for the session.

.PARAMETER FtpHost
  e.g. ftp.niqs.org.ng  (or the server's IP)

.PARAMETER User
  The FTP username.

.PARAMETER RemoteDir
  Document root for the site -- usually /public_html. Trailing slash optional.

.PARAMETER SkipDocuments
  Skips dist/documents (49 MB of official PDFs, 35 MB of it one file). They
  change far less often than the app, so leave them out of routine re-uploads.
  Do NOT skip on the first upload.

.PARAMETER NoSsl
  Falls back to plain FTP. Avoid: plain FTP sends this password in clear text,
  and the same account controls the Institute's mailboxes. Only use it if the
  host genuinely does not offer FTPS.

.EXAMPLE
  .\upload-build.ps1 -FtpHost ftp.niqs.org.ng -User niqsadmin -RemoteDir /public_html

.EXAMPLE
  .\upload-build.ps1 -FtpHost ftp.niqs.org.ng -User niqsadmin -RemoteDir /public_html -SkipDocuments
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$FtpHost,
  [Parameter(Mandatory = $true)][string]$User,
  [Parameter(Mandatory = $true)][string]$RemoteDir,
  [switch]$SkipDocuments,
  [switch]$NoSsl
)

$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Resolve-Path (Join-Path $here '..\dist')

if (-not (Test-Path (Join-Path $dist 'index.html'))) {
  throw "No build found at $dist. Run 'npm --prefix client run build' first."
}
if (-not (Test-Path (Join-Path $dist '.htaccess'))) {
  throw "$dist has no .htaccess. That file makes every URL except the homepage work -- do not upload without it."
}

# -- Credentials ---------------------------------------------------------------
if ($env:NIQS_FTP_PASSWORD) {
  $secure = ConvertTo-SecureString $env:NIQS_FTP_PASSWORD -AsPlainText -Force
  Write-Host "Using NIQS_FTP_PASSWORD from the environment." -ForegroundColor DarkGray
} else {
  $secure = Read-Host -Prompt "FTP password for $User@$FtpHost" -AsSecureString
}
$cred = New-Object System.Net.NetworkCredential($User, $secure)

$scheme = if ($NoSsl) { 'ftp' } else { 'ftp' }   # FtpWebRequest always uses the ftp:// scheme; TLS is a flag
$useSsl = -not $NoSsl
if ($NoSsl) {
  Write-Warning "Plain FTP: this password crosses the network in clear text."
}

$root = "${scheme}://${FtpHost}/" + $RemoteDir.Trim('/')

# -- Helpers -------------------------------------------------------------------
function New-Req([string]$uri, [string]$method) {
  $r = [System.Net.FtpWebRequest]::Create($uri)
  $r.Method = $method
  $r.Credentials = $cred
  $r.EnableSsl = $useSsl
  $r.UsePassive = $true
  $r.UseBinary = $true
  $r.KeepAlive = $true
  $r.Timeout = 120000
  $r.ReadWriteTimeout = 300000
  return $r
}

function Ensure-Dir([string]$uri) {
  try {
    $r = New-Req $uri ([System.Net.WebRequestMethods+Ftp]::MakeDirectory)
    $r.GetResponse().Close()
  } catch [System.Net.WebException] {
    # 550 here means "already exists", which is the normal case on a re-upload.
    $resp = $_.Exception.Response
    if ($null -eq $resp -or $resp.StatusCode -ne [System.Net.FtpStatusCode]::ActionNotTakenFileUnavailable) { throw }
  }
}

function Send-File([string]$localPath, [string]$uri) {
  $r = New-Req $uri ([System.Net.WebRequestMethods+Ftp]::UploadFile)
  $bytes = [System.IO.File]::ReadAllBytes($localPath)
  $r.ContentLength = $bytes.Length
  $s = $r.GetRequestStream()
  $s.Write($bytes, 0, $bytes.Length)
  $s.Close()
  $r.GetResponse().Close()
}

# -- Gather --------------------------------------------------------------------
# -Force is what picks up .htaccess. Without it this script would reproduce the
# exact bug it exists to prevent.
$files = Get-ChildItem -Path $dist -Recurse -File -Force
if ($SkipDocuments) {
  $files = $files | Where-Object { $_.FullName -notmatch '\\documents\\' }
  Write-Host "Skipping dist/documents." -ForegroundColor DarkGray
}

$total = $files.Count
$bytes = ($files | Measure-Object -Property Length -Sum).Sum
Write-Host ""
Write-Host "Uploading $total files ($([math]::Round($bytes/1MB,1)) MB)" -ForegroundColor Cyan
Write-Host "  from  $dist"
Write-Host "  to    $root"
Write-Host ""

# Create every directory first, deepest last, so no upload races its parent.
$dirs = $files | ForEach-Object { $_.DirectoryName } | Sort-Object -Unique
foreach ($d in $dirs) {
  $rel = $d.Substring($dist.Path.Length).TrimStart('\')
  if (-not $rel) { continue }
  $parts = $rel -split '\\'
  for ($i = 0; $i -lt $parts.Count; $i++) {
    Ensure-Dir ($root + '/' + ($parts[0..$i] -join '/'))
  }
}

# -- Upload --------------------------------------------------------------------
$done = 0; $failed = @()
foreach ($f in $files) {
  $rel = $f.FullName.Substring($dist.Path.Length).TrimStart('\') -replace '\\', '/'
  try {
    Send-File $f.FullName ($root + '/' + $rel)
    $done++
  } catch {
    $failed += [pscustomobject]@{ File = $rel; Error = $_.Exception.Message }
  }
  Write-Progress -Activity 'Uploading build' -Status "$done / $total  $rel" -PercentComplete (($done / $total) * 100)
}
Write-Progress -Activity 'Uploading build' -Completed

Write-Host ""
Write-Host "Uploaded $done of $total files." -ForegroundColor Green
if ($failed.Count) {
  Write-Host "$($failed.Count) FAILED:" -ForegroundColor Red
  $failed | ForEach-Object { Write-Host "  $($_.File) -- $($_.Error)" -ForegroundColor Red }
  Write-Host "Re-run to retry; uploads overwrite, so repeating is safe." -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Now check these, in this order:" -ForegroundColor Cyan
Write-Host "  curl -sI http://niqs.org.ng/about      # expect 301 to https, NOT a redirect loop"
Write-Host "  curl -s -o /dev/null -w '%{http_code}' https://niqs.org.ng/about   # expect 200"
Write-Host "  https://niqs.org.ng/robots.txt  /sitemap.xml  /favicon.ico          # all 200"
Write-Host ""
Write-Host "If the site loops or errors, rename .htaccess on the server to .htaccess.off" -ForegroundColor Yellow
Write-Host "and the site returns to how it behaved before this upload." -ForegroundColor Yellow
