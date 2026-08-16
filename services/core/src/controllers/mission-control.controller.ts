import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { TMissionControlRequest, TMissionControlResponse } from "../types/mission.types";
import { sendSuccess } from "../utils/response";
import { TErrorResponse, TSuccessResponse } from "../types";
import { HTTP_STATUS } from "../config/constants";
import missionControlService from "../services/mission-control.service";

class MissionControlController {
    readonly dashboard = asyncHandler(
        async (req: Request<{}, {}, {}, TMissionControlRequest>, res: Response<TSuccessResponse<TMissionControlResponse | null> | TErrorResponse>) => {
            const result = await missionControlService.fetchDashboardData(req.query)

            return sendSuccess({
                data: result,
                message: '',
                res: res,
                statusCode: HTTP_STATUS.ok,
            })
        }
    )
}

export default new MissionControlController()