import { ERROR_CODES, ERROR_MESSAGES } from "../config/constants";
import type { TFieldError } from "../types";

export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 500,
        public readonly code: string = ERROR_CODES.internal,
        public readonly errors: TFieldError[] = [],
        public readonly isOperational = true,
    ) {
        super(message);
        this.name = "AppError";

        Error.captureStackTrace?.(this, this.constructor);
    }

    static badRequest(message: string, errors: TFieldError[] = []): AppError {
        return new AppError(message, 400, ERROR_CODES.badRequest, errors);
    }

    static validation(message: string, errors: TFieldError[]): AppError {
        return new AppError(message, 422, ERROR_CODES.validation, errors);
    }

    static notFound(
        message = ERROR_MESSAGES.routeNotFound,
        errors: TFieldError[] = [],
    ): AppError {
        return new AppError(message, 404, ERROR_CODES.notFound, errors);
    }

    static internal(): AppError {
        return new AppError(
            ERROR_MESSAGES.internal,
            500,
            ERROR_CODES.internal,
            [],
            false,
        );
    }
}
