import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { TMissionControlResponse } from "../types/mission.types";
import { sendSuccess } from "../utils/response";
import { TErrorResponse, TSuccessResponse } from "../types";
import { HTTP_STATUS } from "../config/constants";
import missionControlService from "../services/mission-control.service";
import { AppError } from "../utils/app-error";

class MissionControlController {
  readonly dashboard = asyncHandler(
    async (
      req: Request,
      res: Response<
        TSuccessResponse<TMissionControlResponse | null> | TErrorResponse
      >,
    ) => {
      if (!req.user) throw AppError.authRequired();
      const result = await missionControlService.fetchDashboardData(
        req.user.teamId,
      );

      return sendSuccess({
        data: result,
        message: "Successfully fetch mission control data",
        res: res,
        statusCode: HTTP_STATUS.ok,
      });
    },
  );
}

export default new MissionControlController();
