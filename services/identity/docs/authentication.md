# Authentication Flow (RS256 JWT)

The Identity Service acts as the single source of truth for authentication, providing stateless tokens to clients.

## Security Model
To prevent Cross-Site Scripting (XSS) attacks from stealing access tokens, the frontend never handles raw JWTs. Instead, we use a hybrid **Cookie + JWT** approach:

1. **Login**: The frontend sends credentials to `/api/identity/v1/auth/login`.
2. **Signing**: The Identity service authenticates the user and generates an RS256 JWT using its securely mounted Private Key.
3. **Packaging**: The Identity service packages the JWT into a strictly configured `HttpOnly`, `Secure`, `SameSite=Strict` cookie named `sc_token`.
4. **Transport**: The browser automatically attaches this cookie to all subsequent requests to the backend.
5. **Validation**: Any backend service (Identity, Core, AI) that receives the request can extract the JWT from the cookie and cryptographically verify the signature using the **Public Key**.

## JWT Claims
By default, the Identity service disables default XML SOAP claim mapping, ensuring that the claims injected into the JWT are standard OIDC claims:
- `sub`: User ID (UUID)
- `email`: User Email
- `name`: User Full Name
- `role`: System Role (e.g., `Lead`, `Super`)
- `teamId`: Associated Team UUID

---

## Consumer Guidance (Session Validation Contract)

Downstream services (Core, AI/Data) must implement middleware to validate the `sc_token` cookie. They **MUST NOT** query the Identity database. They must rely solely on validating the RS256 signature via the Public Key provided to them through Docker Secrets at `JWT_PUBLIC_KEY_PATH`.

### Example: Node.js / Express (Core API)

**Dependencies:** `yarn add jsonwebtoken cookie-parser`

```typescript
import jwt from "jsonwebtoken";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

let publicKeyCache: string | null = null;
function getPublicKey() {
  if (!publicKeyCache) {
    publicKeyCache = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH || "/run/secrets/jwt_public", "utf8");
  }
  return publicKeyCache;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.sc_token;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, getPublicKey(), {
      algorithms: ["RS256"],
      issuer: process.env.JWT_ISSUER || "shiftcore-identity",
      audience: process.env.JWT_AUDIENCE || "shiftcore-api",
    });
    
    // Successfully extracted User claims
    (req as any).user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
```

### Example: Python / FastAPI (AI/Data API)

**Dependencies:** `pip install pyjwt cryptography`

```python
import os
import jwt
from fastapi import Cookie, HTTPException, status

_public_key_cache = None
def get_public_key():
    global _public_key_cache
    if not _public_key_cache:
        with open(os.getenv("JWT_PUBLIC_KEY_PATH", "/run/secrets/jwt_public"), "r") as f:
            _public_key_cache = f.read()
    return _public_key_cache

def require_auth(sc_token: str | None = Cookie(default=None)):
    if not sc_token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        decoded = jwt.decode(
            sc_token,
            get_public_key(),
            algorithms=["RS256"],
            issuer=os.getenv("JWT_ISSUER", "shiftcore-identity"),
            audience=os.getenv("JWT_AUDIENCE", "shiftcore-api"),
        )
        # Successfully extracted User claims
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```
