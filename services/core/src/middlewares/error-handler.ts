import type {
    ErrorRequestHandler,
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import { ENVIRONMENT, ERROR_MESSAGES } from "../config/constants";
import type { TErrorResponse } from "../types";
import { AppError } from "../utils/app-error";
import { sendError } from "../utils/response";

const normalizeError = (error: unknown): AppError => {
    if (error instanceof AppError) return error;

    if (
        error instanceof SyntaxError
        && "status" in error
        && error.status === 400
    ) {
        return AppError.badRequest(ERROR_MESSAGES.invalidJson);
    }

    if (error instanceof Error && ENVIRONMENT.isDevelopment) {
        return new AppError(error.message, 500, undefined, [], false);
    }

    return AppError.internal();
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
    next(AppError.notFound(ERROR_MESSAGES.routeNotFound));
};

export const globalErrorHandler: ErrorRequestHandler = (
    error: unknown,
    req: Request,
    res: Response<TErrorResponse>,
    next: NextFunction,
) => {
    if (res.headersSent) return next(error);

    const normalizedError = normalizeError(error);

    console.error("CoreRequestError", {
        code: normalizedError.code,
        message: normalizedError.message,
        statusCode: normalizedError.statusCode,
        method: req.method,
        path: req.originalUrl,
        requestId: req.get("x-request-id"),
        errors: normalizedError.errors,
        ...(!normalizedError.isOperational && normalizedError.stack
            ? { stack: normalizedError.stack }
            : {}),
    });

    return sendError({
        req,
        res,
        errorCode: normalizedError.code,
        message: normalizedError.message,
        errors: normalizedError.errors,
        statusCode: normalizedError.statusCode,
    });
};
