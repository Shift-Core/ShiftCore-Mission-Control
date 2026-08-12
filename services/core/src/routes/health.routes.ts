import { Router } from "express";
import healthController from "../controllers/health.controller";

const router = Router();

router.get("/", healthController.live);
router.get("/db", healthController.database);

export default router;
