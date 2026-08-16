# Authentication Flow (RS256 JWT)

The Identity Service acts as the single source of truth for authentication, providing stateless tokens to clients.

## Security Model
To prevent Cross-Site Scripting (XSS) attacks from stealing access tokens, the frontend never handles raw JWTs. Instead, we use a hybrid **Cookie + JWT** approach:

1. **Login**: The frontend sends credentials to `/api/identity/v1/auth/login`.
2. **Signing**: The Identity service authenticates the user and generates an RS256 JWT using its securely mounted Private Key.
3. **Packaging**: The Identity service packages the JWT into a strictly configured `HttpOnly`, `Secure`, `SameSite=Strict` cookie named `sc_token`.
4. **Transport**: The browser automatically attaches this cookie to all subsequent requests to the backend.
5. **Validation**: Any backend service (Identity, Core, AI) that receives the request can extract the JWT from the cookie and cryptographically verify the signature using the **Public Key**.

## Why RS256 and Docker Secrets?
- **Stateless Validation**: `core` and `ai` services do not need to query the Identity database to validate if a user is logged in. They only need the Public Key to verify the signature.
- **Docker Secrets**: The private key is highly sensitive. It is mapped securely via Docker Secrets (`/run/secrets/jwt_private`) meaning it exists only in memory and never on the container's file system, protecting it from image scraping or unintended leaks.

## JWT Claims
By default, the Identity service disables default XML SOAP claim mapping, ensuring that the claims injected into the JWT are standard standard OIDC claims:
- `sub`: User ID (UUID)
- `email`: User Email
- `name`: User Full Name
- `role`: System Role (e.g., `Lead`, `Super`)
- `teamId`: Associated Team UUID
