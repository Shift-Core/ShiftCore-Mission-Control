import { Router } from "express";
import missionController from "../controllers/mission-control.controller";
import { validateQuery } from "../middlewares/validate";
import { MissionControlDashboardQuery } from "../validations/mission-control.validation";

const router = Router();

router
    .get('/', validateQuery(MissionControlDashboardQuery), missionController.dashboard)

export default router;