import { Router } from "express";
import notImplementedHandler from "../utils/not-implemented";
import taskController from "../controllers/task.controller";

const router = Router();

router
  .route("/")
  .get(notImplementedHandler.handle)
  .post(notImplementedHandler.handle);

router.patch("/:id/status", taskController.status);

router
  .route("/:id")
  .get(notImplementedHandler.handle)
  .patch(notImplementedHandler.handle);

export default router;
