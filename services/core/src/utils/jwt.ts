import { readFileSync } from "node:fs";
import { createPublicKey, type KeyObject } from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { AUTH, USER_ROLE } from "../config/constants";
import type { TAuthenticatedUser, TUserRole } from "../types";
import { AppError } from "./app-error";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const USER_ROLES = Object.values(USER_ROLE);

const isUserRole = (value: unknown): value is TUserRole =>
  typeof value === "string" && USER_ROLES.includes(value as TUserRole);

class JwtService {
  private publicKey: KeyObject | null = null;

  private getPublicKey(): KeyObject {
    if (!this.publicKey) {
      const pem = readFileSync(AUTH.publicKeyPath, "utf8");
      this.publicKey = createPublicKey(pem);
    }

    return this.publicKey;
  }

  private parseClaims(payload: JwtPayload | string): TAuthenticatedUser {
    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !UUID_PATTERN.test(payload.sub) ||
      typeof payload.email !== "string" ||
      payload.email.trim().length === 0 ||
      typeof payload.name !== "string" ||
      payload.name.trim().length === 0 ||
      !isUserRole(payload.role) ||
      typeof payload.teamId !== "string" ||
      !UUID_PATTERN.test(payload.teamId) ||
      typeof payload.jti !== "string" ||
      payload.jti.length === 0 ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      throw AppError.authInvalid();
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      teamId: payload.teamId,
    };
  }

  verify(token: string): TAuthenticatedUser {
    const payload = jwt.verify(token, this.getPublicKey(), {
      algorithms: ["RS256"],
      issuer: AUTH.issuer,
      audience: AUTH.audience,
    });

    return this.parseClaims(payload);
  }
}

export default new JwtService();
