#!/usr/bin/env bash
# =============================================================================
# ShiftCore Mission Control - Local JWT RSA Key Generator
# Generates RS256 private and public keys for local development testing.
# Keys are stored in the .secrets directory which is gitignored.
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_DIR="$ROOT_DIR/.secrets"

echo "==> Generating local RS256 JWT keys for Identity API..."

if [[ ! -d "$SECRETS_DIR" ]]; then
  mkdir -p "$SECRETS_DIR"
fi

cd "$SECRETS_DIR"

if [[ -f jwt_private.pem && -f jwt_public.pem ]]; then
  echo "    Keys already exist in .secrets directory. Skipping generation."
  exit 0
fi

# Generate 2048-bit RSA private key
openssl genrsa -out jwt_private.pem 2048

# Extract public key
openssl rsa -in jwt_private.pem -outform PEM -pubout -out jwt_public.pem

echo "    Keys generated successfully:"
echo "    - .secrets/jwt_private.pem"
echo "    - .secrets/jwt_public.pem"
echo "==> Local JWT setup complete."
