import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ObjectSchema, ValidationErrorItem } from "joi";
import { ERROR_MESSAGES } from "../config/constants";
import type { TFieldError, TRequestPart } from "../types";
import { AppError } from "../utils/app-error";

const formatJoiErrors = (details: ValidationErrorItem[]): TFieldError[] =>
  details.map((item) => ({
    field: item.path.join(".") || "value",
    message: item.message.replaceAll('"', ""),
  }));

const setValidatedValue = (
  req: Request,
  target: TRequestPart,
  value: unknown,
): void => {
  Object.defineProperty(req, target, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
};

const isEmptyBody = (value: unknown): boolean =>
  value == null ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0);

const validate =
  (
    schema: ObjectSchema,
    target: TRequestPart,
    rejectEmpty = false,
  ): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (rejectEmpty && isEmptyBody(req[target])) {
      next(
        AppError.validation(ERROR_MESSAGES.validation, [
          {
            field: target,
            message: ERROR_MESSAGES.requestBodyRequired,
          },
        ]),
      );
      return;
    }

    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      next(
        AppError.validation(
          ERROR_MESSAGES.validation,
          formatJoiErrors(error.details),
        ),
      );
      return;
    }

    setValidatedValue(req, target, value);
    next();
  };

export const validateBody = (schema: ObjectSchema): RequestHandler =>
  validate(schema, "body", true);

export const validateQuery = (schema: ObjectSchema): RequestHandler =>
  validate(schema, "query");

export const validateParams = (schema: ObjectSchema): RequestHandler =>
  validate(schema, "params");
