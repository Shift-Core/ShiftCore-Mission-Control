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

export const ERROR_CODES = Object.freeze({
    badRequest: "BAD_REQUEST",
    validation: "VALIDATION_ERROR",
    notFound: "NOT_FOUND",
    internal: "INTERNAL_SERVER_ERROR",
});

export const ERROR_MESSAGES = Object.freeze({
    invalidJson: "Invalid JSON payload",
    routeNotFound: "Route not found",
    internal: "An unexpected error occurred",
});
