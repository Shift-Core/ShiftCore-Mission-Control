import { randomUUID } from "node:crypto";
import type {
    TErrorResponse,
    TErrorResponseOptions,
    TSuccessResponse,
    TSuccessResponseOptions,
} from "../types";

export const sendSuccess = <T>({
    res,
    message,
    data,
    statusCode = 200,
}: TSuccessResponseOptions<T>) => {
    const response: TSuccessResponse<T> = {
        success: true,
        message,
        data,
    };

    return res.status(statusCode).json(response);
};

export const sendError = ({
    req,
    res,
    errorCode,
    message,
    errors = [],
    statusCode = 500,
}: TErrorResponseOptions) => {
    const traceId = req.get("x-request-id") ?? `req_${randomUUID()}`;

    const response: TErrorResponse = {
        success: false,
        message,
        data: null,
        errorCode,
        errors,
        traceId,
    };

    res.setHeader("X-Request-Id", traceId);
    return res.status(statusCode).json(response);
};
