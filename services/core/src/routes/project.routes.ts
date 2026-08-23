import { Router } from "express";
import { USER_ROLE } from "../config/constants";
import { requireRole } from "../middlewares/authorize";
import notImplementedHandler from "../utils/not-implemented";

const router = Router();

router
  .route("/")
  .get(notImplementedHandler.handle)
  .post(
    requireRole(USER_ROLE.super, USER_ROLE.lead),
    notImplementedHandler.handle,
  );

router
  .route("/:id")
  .get(notImplementedHandler.handle)
  .patch(
    requireRole(USER_ROLE.super, USER_ROLE.lead),
    notImplementedHandler.handle,
  );

export default router;
