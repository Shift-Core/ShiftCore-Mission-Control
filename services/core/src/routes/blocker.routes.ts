import { Router } from "express";
import notImplementedHandler from "../utils/not-implemented";

const router = Router();

router.route("/")
    .get(notImplementedHandler.handle)
    .post(notImplementedHandler.handle);

router.route("/:id")
    .get(notImplementedHandler.handle)
    .patch(notImplementedHandler.handle);

export default router;
