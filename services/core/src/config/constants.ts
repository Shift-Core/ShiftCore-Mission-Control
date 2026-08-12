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
  invalidJson: "Invalid JSON payload",
  validation: "Validation failed",
  requestBodyRequired: "Request body must contain at least one field",
  routeNotFound: "Route not found",
  internal: "An unexpected error occurred",
});
