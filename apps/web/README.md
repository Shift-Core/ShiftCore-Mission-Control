# ShiftCore Web

Frontend shell for the R24-06 release slice.

## Routes

- `/login` — public login route
- `/mission-control` — protected mission-control route

## API Client

The frontend uses gateway-relative API paths.

- Base path: `/api`
- Credentials: included
- Authentication tokens are not stored in frontend storage

API requests are routed through the Nginx gateway.

## Development

Install dependencies:

```bash
npm ci
