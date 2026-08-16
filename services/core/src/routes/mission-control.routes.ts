import { Router } from "express";
import missionController from "../controllers/mission-control.controller";

const router = Router();

router
    .get('/', missionController.dashboard)

export default router;