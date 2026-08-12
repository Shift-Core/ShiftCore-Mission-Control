import { Router } from "express";
import healthRoutes from "./health.routes";
import projectRoutes from "./project.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/projects", projectRoutes);

export default router;
