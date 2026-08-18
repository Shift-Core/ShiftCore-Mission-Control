# AI/Data API

The ShiftCore AI/Data service provides the release foundation for the
weekly-summary capability.

For R24-05, the service freezes and validates the deterministic summary
contract without making the release dependent on an external AI provider.

## Ownership

- Jira: SMC-97 / R24-05 foundation; SMC-104 / R24-12 endpoint
- Owner: Peter
- Reviewer: Mohamed Sameh
- Stack: FastAPI, Pydantic
- Container service: `ai`
- Internal port: `8000`
- Persistence: none in this release slice

## Current R24-05 Scope

R24-05 provides:

- a container-ready FastAPI service;
- `GET /health`;
- the approved KPI snapshot schema;
- deterministic weekly-summary request and response models;
- approved input and output fixtures;
- deterministic summary generation;
- fallback-warning support;
- schema, formula, repeatability, fixture, and health tests;
- the AI/Data OpenAPI contract.

The protected weekly-summary preview HTTP endpoint is intentionally not
implemented by R24-05.

That endpoint is owned by R24-12:

```text
POST /api/ai/v1/summaries/weekly/preview
````
## R24-12 Weekly Summary Preview

R24-12 exposes the release weekly-summary preview endpoint:

```text
POST /api/ai/v1/summaries/weekly/preview
````

The endpoint accepts the approved KPI snapshot contract and returns a
non-persisted deterministic weekly summary.

The response uses:

```text
source=deterministic
schemaVersion=1.0
```

Given the same material request input, the endpoint returns the same material:

* source snapshot;
* section keys;
* section order;
* section content.

`generatedAt` may differ between requests.

Invalid request data returns the release-safe validation envelope:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errorCode": "VALIDATION_ERROR",
  "errors": [],
  "traceId": "req_example"
}
```

`X-Request-Id`, when supplied, is preserved as the response correlation
identifier.

The endpoint is protected by the Identity-issued `sc_token` session cookie.
AI/Data validates the RS256 JWT locally using only the mounted public key. It
validates the approved issuer, audience, lifetime, and required release claims;
it does not call Identity for each protected request. Missing, malformed,
expired, wrongly scoped, incorrectly signed, or incomplete session tokens return
the safe `401 AUTH_REQUIRED` envelope without exposing JWT or key details.

Runtime authentication uses:

```text
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public
JWT_ISSUER=shiftcore-identity
JWT_AUDIENCE=shiftcore-api
SC_TOKEN_COOKIE_NAME=sc_token
```

The preview does not persist generated summaries and does not require an
external AI provider.

For the current R24-12 contract, the request uses the approved
`core-mission-control-v1` KPI snapshot shape. The browser-copied snapshot is a
release evidence contract, not cryptographic provenance; broader authoritative
server-to-server Core retrieval is outside this endpoint implementation and is
subject to the release contract-drift/stabilization review.

## Deterministic Release Mode

The release default is:

```text
AI_PROVIDER=deterministic
```

Deterministic mode does not require an external provider or provider API key.

Given the same material KPI input, the generated summary keeps the same:

* section keys;
* section order;
* material section content;
* source snapshot.

`generatedAt` may differ between executions.

The deterministic response uses:

```text
source=deterministic
```

If a future optional provider adapter fails, the release flow must fall back
to deterministic output and may include a non-secret warning such as:

```text
provider_fallback_used
```

External provider integration, provider selection, prompt tuning, and model
selection are outside R24-05.

## KPI Snapshot

The release snapshot contains:

* `plannedTasks`
* `toDoTasks`
* `inProgressTasks`
* `doneTasks`
* `completionRate`
* `activeBlockers`

Release validation requires:

```text
plannedTasks = toDoTasks + inProgressTasks + doneTasks
```

Completion is:

```text
completionRate = doneTasks / plannedTasks * 100
```

rounded to one decimal place.

When `plannedTasks` is `0`, `completionRate` is `0`.

## Summary Sections

The deterministic summary contains exactly three sections in this order:

1. `progress`
2. `blockers`
3. `attention`

The response also includes:

* `schemaVersion`
* project and sprint identity;
* `generatedAt`;
* the source KPI snapshot;
* `source`;
* `warnings`.

## Fixtures

Approved contract fixtures are stored in:

```text
fixtures/source_snapshot.v1.json
fixtures/weekly_summary.v1.json
```

`source_snapshot.v1.json` is the approved deterministic input fixture.

`weekly_summary.v1.json` is the expected response for that input when the
fixed fixture generation time is used.

## API Contract

The AI/Data OpenAPI contract is stored at:

```text
../../contracts/ai.openapi.yaml
```

R24-05 documents the current `/health` endpoint and freezes the weekly-summary
request and response schemas.

The preview HTTP path itself is added by R24-12 when that endpoint is
implemented.

## Local Development

Create or activate a Python virtual environment, then install dependencies:

```bash
python -m pip install -r services/ai/requirements.txt
```

From `services/ai`, start the service with:

```bash
AI_PROVIDER=deterministic \
python -m uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000
```

Check health:

```bash
curl -fsS http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "ai",
  "mode": "deterministic"
}
```

## Tests

From `services/ai`, run:

```bash
python -m pytest -v
```

The R24-05 suite covers:

* request fixture schema validation;
* response fixture schema validation;
* invalid KPI status totals;
* invalid completion-rate calculations;
* required summary sections;
* deterministic repeatability;
* exact approved fixture generation;
* fallback warning behavior;
* approved seed KPI values;
* zero-planned-task behavior;
* health without a provider key.

R24-12 additionally verifies the protected preview route with RS256 session
tokens, including missing cookie, malformed token, invalid signature, expiry,
issuer/audience mismatch, missing required claims, safe `401` responses, and
runtime OpenAPI security metadata.

## Docker Compose

Build the AI/Data image:

```bash
docker compose build ai
```

Start only the AI/Data service:

```bash
docker compose up -d --no-deps ai
```

Check container status:

```bash
docker compose ps ai
```

Check health from inside the container:

```bash
docker compose exec -T ai \
  curl -fsS http://127.0.0.1:8000/health
```

The Compose service key is `ai`.

On SELinux-enforcing development hosts such as Fedora, file-backed Compose
secrets may retain a host label that prevents the container from reading the
JWT public key. If `/run/secrets/jwt_public` returns `Permission denied`, label
the generated local key files for container access and recreate the service:

```bash
sudo chcon -t container_file_t \
  secrets/jwt_public.pem \
  secrets/jwt_private.pem

docker compose up -d --force-recreate --no-deps ai
```

This is a local-development filesystem-label fix only; key contents must never
be committed or printed.

Port `8000` is an internal service port; release browser-facing traffic is
expected to pass through the Nginx gateway rather than directly exposing the
AI container port.

## Release Boundaries

R24-05 does not implement:

* a required external AI provider call;
* provider or model selection;
* prompt optimization;
* the protected weekly-summary preview HTTP endpoint;
* database persistence;
* background generation jobs;
* summary review, edit, approval, or publishing;
* AI recommendations or management decisions.

