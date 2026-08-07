# Auth Claims Contract (R24-04)

RS256-signed JWT stored in the `sc_token` HttpOnly cookie.

**Identity API** is the only application permitted to authenticate credentials and sign JWTs (private key).  
**Core** and **AI/Data** receive only the public key and validate locally.

## Required Release Claims

| Claim   | Purpose                          |
|---------|----------------------------------|
| `iss`   | Approved Identity token issuer   |
| `aud`   | Approved ShiftCore API audience  |
| `sub`   | Authenticated user identifier    |
| `email` | Authenticated user email         |
| `name`  | Display name                     |
| `role`  | Release role (Super / Core / Identity / …) |
| `teamId`| Team/workspace scope             |
| `iat`   | Issue time                       |
| `nbf`   | Earliest permitted use           |
| `exp`   | Expiration time                  |
| `jti`   | Unique token identifier          |

Invalid or missing authentication → `401 Unauthorized`  
Valid authentication without required permission → `403 Forbidden`
