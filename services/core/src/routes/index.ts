import { Router } from "express";
import blockerRoutes from "./blocker.routes";
import healthRoutes from "./health.routes";
import projectRoutes from "./project.routes";
import sprintRoutes from "./sprint.routes";
import taskRoutes from "./task.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/projects", projectRoutes);
router.use("/sprints", sprintRoutes);
router.use("/tasks", taskRoutes);
router.use("/blockers", blockerRoutes);

export default router;
