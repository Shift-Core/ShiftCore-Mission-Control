import { Router } from "express";
import { API } from "../config/constants";
import blockerRoutes from "./blocker.routes";
import healthRoutes from "./health.routes";
import projectRoutes from "./project.routes";
import sprintRoutes from "./sprint.routes";
import taskRoutes from "./task.routes";
import healthController from "../controllers/health.controller";
import missionControlRoutes from "./mission-control.routes";
import { requireAuth } from "../middlewares/authenticate";

const router = Router();
const apiRouter = Router();

router.use("/health", healthRoutes);
apiRouter.get("/health/db", healthController.database);

apiRouter.use(requireAuth);

apiRouter.use("/projects", projectRoutes);
apiRouter.use("/sprints", sprintRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/blockers", blockerRoutes);
apiRouter.use("/mission-control", missionControlRoutes);

router.use(API.basePath, apiRouter);

export default router;
