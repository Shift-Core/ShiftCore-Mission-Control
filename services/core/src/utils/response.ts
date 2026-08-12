import { randomUUID } from "node:crypto";
import { HTTP_STATUS } from "../config/constants";
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
  statusCode = HTTP_STATUS.ok,
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
  statusCode = HTTP_STATUS.internalServerError,
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
