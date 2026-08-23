import type { RequestHandler } from "express";
import type { TUserRole } from "../types";
import { AppError } from "../utils/app-error";

export const requireRole =
  (...roles: TUserRole[]): RequestHandler =>
  (req, _res, next): void => {
    if (!req.user) {
      next(AppError.authRequired());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden());
      return;
    }

    next();
  };
