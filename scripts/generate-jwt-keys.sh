#!/usr/bin/env bash
# =============================================================================
# ShiftCore Mission Control - JWT RSA Key Generator
# Generates RS256 keys (private/public) into the secrets/ directory.
# Used by local docker-compose to mount as Docker secrets.
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_DIR="$ROOT_DIR/secrets"

PRIVATE_KEY="$SECRETS_DIR/jwt_private.pem"
PUBLIC_KEY="$SECRETS_DIR/jwt_public.pem"

FORCE=false
if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

echo "==> ShiftCore JWT Key Generator"
echo "    Target: $SECRETS_DIR"

mkdir -p "$SECRETS_DIR"

if [[ -f "$PRIVATE_KEY" ]] || [[ -f "$PUBLIC_KEY" ]]; then
  if [[ "$FORCE" == "false" ]]; then
    echo "    Keys already exist. Use --force to overwrite."
    exit 0
  else
    echo "    --force provided. Overwriting existing keys..."
  fi
fi

# Generate 4096-bit RSA private key
openssl genrsa -out "$PRIVATE_KEY" 4096 2>/dev/null
chmod 600 "$PRIVATE_KEY"

# Extract public key
openssl rsa -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY" 2>/dev/null

echo "    [OK] Generated jwt_private.pem (chmod 600)"
echo "    [OK] Generated jwt_public.pem"
echo "    These files will be mounted into containers via Docker secrets."
