import { Router } from "express";
import healthRoutes from "./health.routes";
import projectRoutes from "./project.routes";
import sprintRoutes from "./sprint.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/projects", projectRoutes);
router.use("/sprints", sprintRoutes);

export default router;
