param(
    [switch]$Force
)

# Verification status: syntax-reviewed, but not yet runtime-tested on Windows.

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$rootDirectory = Split-Path -Parent $PSScriptRoot
$secretsDirectory = Join-Path $rootDirectory "secrets"
$privateKey = Join-Path $secretsDirectory "jwt_private.pem"
$publicKey = Join-Path $secretsDirectory "jwt_public.pem"

Write-Host "==> ShiftCore JWT Key Generator"
Write-Host "    Target: $secretsDirectory"

if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
    throw "OpenSSL was not found in PATH. Install OpenSSL, restart PowerShell, and run this script again."
}

New-Item -ItemType Directory -Force -Path $secretsDirectory | Out-Null

if ((Test-Path $privateKey) -or (Test-Path $publicKey)) {
    if (-not $Force) {
        Write-Host "    Keys already exist. Use -Force to overwrite."
        exit 0
    }

    Write-Host "    -Force provided. Overwriting existing keys..."
}

& openssl genrsa -out $privateKey 4096 2>$null
if ($LASTEXITCODE -ne 0) {
    throw "Failed to generate the JWT private key."
}

& openssl rsa -in $privateKey -pubout -out $publicKey 2>$null
if ($LASTEXITCODE -ne 0) {
    throw "Failed to generate the JWT public key."
}

Write-Host "    [OK] Generated jwt_private.pem"
Write-Host "    [OK] Generated jwt_public.pem"
Write-Host "    These files are ignored by Git and mounted through Docker secrets."
