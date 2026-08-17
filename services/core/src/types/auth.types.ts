import type { USER_ROLE } from "../config/constants";

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export type TAuthenticatedUser = {
  sub: string;
  email: string;
  name: string;
  role: TUserRole;
  teamId: string;
};
