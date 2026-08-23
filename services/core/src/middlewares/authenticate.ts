import type { RequestHandler } from "express";
import { AUTH } from "../config/constants";
import { AppError } from "../utils/app-error";
import jwtService from "../utils/jwt";

export const requireAuth: RequestHandler = (req, _res, next): void => {
  const token: unknown = req.cookies?.[AUTH.cookieName];

  if (typeof token !== "string" || token.length === 0) {
    next(AppError.authRequired());
    return;
  }

  req.user = jwtService.verify(token);
  next();
};
