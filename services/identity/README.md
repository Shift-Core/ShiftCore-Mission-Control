# ShiftCore Identity Service

The Identity Service acts as the centralized authentication and authorization provider for the ShiftCore Mission Control ecosystem. It issues stateless RS256 JWTs that other downstream services (like Core and AI) can securely validate.

## Architecture & Infrastructure
This service uses:
- **ASP.NET Core 8** Minimal APIs
- **Entity Framework Core 8** with PostgreSQL
- **RS256 Asymmetric Encryption** for JWT generation
- **Docker Secrets** for secure key management

For an in-depth look at the architecture, please refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - High-level system design.
- [docs/setup.md](./docs/setup.md) - Local development setup and initialization.
- [docs/authentication.md](./docs/authentication.md) - Detailed breakdown of the RS256 JWT flow and Cookie strategies.

## Development

All commands are expected to be run from the repository root through Docker Compose. See the [setup guide](./docs/setup.md) for initialization instructions.
