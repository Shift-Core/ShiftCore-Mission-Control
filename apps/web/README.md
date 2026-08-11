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
npm run dev
```

### Build for Production

```bash
npm run build
```

## Docker

Build and run using Docker Compose:

```bash
docker compose build web
docker compose up -d web
```

## Environment Variables

No `.env` file is required for the React frontend, as API requests are routed via the Nginx gateway using relative paths.
