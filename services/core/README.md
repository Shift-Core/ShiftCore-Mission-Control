# Core API

**Owner:** Abo El Ala  
**Stack:** Express.js  
**Schema:** `core` (Prisma Migrate)  
**Release responsibilities:** Seeded project/sprint/tasks/blockers, board read, one task transition, KPI snapshot  

Build context and Dockerfile are owned by Abo El Ala.  
Business logic is out of scope for R24-04.

## Local container workflow

The Core container starts in development mode and runs these steps in order:

1. Generate Prisma Client.
2. Apply committed migrations with `prisma migrate deploy`.
3. Start the Express server with file watching enabled.

Container-generated Prisma files use an isolated volume so Docker does not
create root-owned generated files in the host workspace.

From the repository root:

```bash
docker compose up --build postgres core
```

Core seed data is explicit and is not applied on every container restart:

```bash
docker compose exec core yarn db:seed
```

The seed is idempotent and creates the approved demo KPI snapshot: one active
project and sprint, three tasks split across `ToDo`, `InProgress`, and `Done`,
and one active blocker.

Migration authoring is a developer action. Commit migrations under
`prisma/migrations`, then let containers apply them with `yarn db:deploy`.
