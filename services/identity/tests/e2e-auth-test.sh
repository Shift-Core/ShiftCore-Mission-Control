#!/usr/bin/env bash
# =============================================================================
# ShiftCore Mission Control - Identity E2E Auth Test
# Validates the Login -> /me -> Logout JWT flow
# =============================================================================

set -e

echo "==> Waiting for Identity Service..."
until curl -s -f -o /dev/null "http://localhost/health/identity"; do
    echo "    Identity service not ready, retrying in 2 seconds..."
    sleep 2
done

echo ""
echo "==> 1. Testing Invalid Credentials"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost/api/identity/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lead@shiftcore.local","password":"wrongpassword"}')

HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_STATUS" != "401" ]; then
    echo "❌ Expected 401 for invalid credentials, got $HTTP_STATUS"
    exit 1
fi
echo "✅ Invalid credentials rejected safely."

echo ""
echo "==> 2. Testing Valid Login"
rm -f cookies.txt
RESPONSE=$(curl -s -w "\n%{http_code}" -c cookies.txt -X POST http://localhost/api/identity/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lead@shiftcore.local","password":"local_dev_only_change_me"}')

HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Expected 200 for valid login, got $HTTP_STATUS"
    exit 1
fi
echo "✅ Login successful. sc_token cookie captured."

echo ""
echo "==> 3. Testing /me (Session Validation)"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookies.txt http://localhost/api/identity/v1/auth/me)

HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Expected 200 for /me, got $HTTP_STATUS"
    exit 1
fi

if [[ "$HTTP_BODY" != *"lead@shiftcore.local"* ]]; then
    echo "❌ Expected user profile in /me response, but it was missing."
    exit 1
fi
echo "✅ /me returned the seeded Lead profile."

echo ""
echo "==> 4. Testing Logout"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookies.txt -c cookies.txt -X POST http://localhost/api/identity/v1/auth/logout)

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Expected 200 for logout, got $HTTP_STATUS"
    exit 1
fi
echo "✅ Logout successful. Cookie cleared."

echo ""
echo "==> 5. Testing /me Post-Logout (Expired Session)"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookies.txt http://localhost/api/identity/v1/auth/me)

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_STATUS" != "401" ]; then
    echo "❌ Expected 401 for /me after logout, got $HTTP_STATUS"
    exit 1
fi
echo "✅ Protected route rejected after logout."
echo ""
echo "🎉 All E2E Auth tests passed successfully!"
rm -f cookies.txt
