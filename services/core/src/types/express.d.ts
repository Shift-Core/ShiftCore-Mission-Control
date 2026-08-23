import type { TAuthenticatedUser } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: TAuthenticatedUser;
    }
  }
}

export {};
