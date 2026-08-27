import "dotenv/config";

const DEFAULT_PORT = 4000;

const parsedPort = Number(process.env.PORT ?? DEFAULT_PORT);

if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

export const SERVER = Object.freeze({
  host: "0.0.0.0",
  port: parsedPort,
  serviceName: "core",
});

export const API = Object.freeze({
  basePath: "/api/core/v1",
});

export const TEAM_ID =
  process.env.TEAM_ID ?? "3b5f3ec5-cc27-4d68-8f4d-d80545d6b9c1";

export const AUTH = Object.freeze({
  cookieName: process.env.SC_TOKEN_COOKIE_NAME ?? "sc_token",
  issuer: process.env.JWT_ISSUER ?? "shiftcore-identity",
  audience: process.env.JWT_AUDIENCE ?? "shiftcore-api",
  publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH ?? "/run/secrets/jwt_public",
});

export const USER_ROLE = Object.freeze({
  lead: "Lead",
  super: "Super",
  core: "Core",
  identity: "Identity",
} as const);

export const ENVIRONMENT = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? "development",
  isDevelopment: (process.env.NODE_ENV ?? "development") === "development",
});

export const HTTP_STATUS = Object.freeze({
  ok: 200,
  created: 201,
  accepted: 202,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  unprocessableEntity: 422,
  tooManyRequests: 429,
  internalServerError: 500,
  notImplemented: 501,
  serviceUnavailable: 503,
});

export const ERROR_CODES = Object.freeze({
  authRequired: "AUTH_REQUIRED",
  authInvalid: "AUTH_INVALID",
  authExpired: "AUTH_EXPIRED",
  forbidden: "FORBIDDEN",
  validation: "VALIDATION_ERROR",
  notFound: "NOT_FOUND",
  conflict: "CONFLICT",
  invalidTransition: "INVALID_TRANSITION",
  rateLimited: "RATE_LIMITED",
  aiProviderUnavailable: "AI_PROVIDER_UNAVAILABLE",
  notImplemented: "NOT_IMPLEMENTED",
  internal: "INTERNAL_ERROR",
});

export const ERROR_MESSAGES = Object.freeze({
  authRequired: "Authentication is required",
  authInvalid: "Invalid authentication token",
  authExpired: "Authentication token has expired",
  forbidden: "You do not have permission to perform this action",
  invalidJson: "Invalid JSON payload",
  validation: "Validation failed",
  requestBodyRequired: "Request body must contain at least one field",
  routeNotFound: "Route not found",
  internal: "An unexpected error occurred",
});
