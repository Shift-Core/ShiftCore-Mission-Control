import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from "../config/constants";
import type { TFieldError } from "../types";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = HTTP_STATUS.internalServerError,
    public readonly code: string = ERROR_CODES.internal,
    public readonly errors: TFieldError[] = [],
    public readonly isOperational = true,
  ) {
    super(message);
    this.name = "AppError";

    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string, errors: TFieldError[] = []): AppError {
    return new AppError(
      message,
      HTTP_STATUS.badRequest,
      ERROR_CODES.validation,
      errors,
    );
  }

  static validation(message: string, errors: TFieldError[]): AppError {
    return new AppError(
      message,
      HTTP_STATUS.unprocessableEntity,
      ERROR_CODES.validation,
      errors,
    );
  }

  static authRequired(message = ERROR_MESSAGES.authRequired): AppError {
    return new AppError(
      message,
      HTTP_STATUS.unauthorized,
      ERROR_CODES.authRequired,
    );
  }

  static authInvalid(message = ERROR_MESSAGES.authInvalid): AppError {
    return new AppError(
      message,
      HTTP_STATUS.unauthorized,
      ERROR_CODES.authInvalid,
    );
  }

  static authExpired(message = ERROR_MESSAGES.authExpired): AppError {
    return new AppError(
      message,
      HTTP_STATUS.unauthorized,
      ERROR_CODES.authExpired,
    );
  }

  static forbidden(message = ERROR_MESSAGES.forbidden): AppError {
    return new AppError(message, HTTP_STATUS.forbidden, ERROR_CODES.forbidden);
  }

  static notFound(
    message = ERROR_MESSAGES.routeNotFound,
    errors: TFieldError[] = [],
  ): AppError {
    return new AppError(
      message,
      HTTP_STATUS.notFound,
      ERROR_CODES.notFound,
      errors,
    );
  }

  static internal(): AppError {
    return new AppError(
      ERROR_MESSAGES.internal,
      HTTP_STATUS.internalServerError,
      ERROR_CODES.internal,
      [],
      false,
    );
  }
}
