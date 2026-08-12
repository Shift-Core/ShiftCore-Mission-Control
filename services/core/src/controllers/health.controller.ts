import type { Request, Response } from "express";
import { HTTP_STATUS, SERVER } from "../config/constants";
import healthService from "../services/health.service";
import type {
    TDatabaseHealthResponse,
    THealthResponse,
} from "../types";
import { asyncHandler } from "../utils/async-handler";

class HealthController {
    readonly live = (
        _req: Request,
        res: Response<THealthResponse>,
    ) => {
        return res.status(HTTP_STATUS.ok).json({
            status: "ok",
            service: SERVER.serviceName,
            datetime: new Date().toISOString(),
        });
    };

    readonly database = asyncHandler(async (
        _req: Request,
        res: Response<TDatabaseHealthResponse>,
    ) => {
        const datetime = new Date().toISOString();
        const isConnected = await healthService.checkDatabase();

        if (!isConnected) {
            return res.status(HTTP_STATUS.serviceUnavailable).json({
                status: "error",
                service: SERVER.serviceName,
                datetime,
                database: {
                    status: "unavailable",
                },
            });
        }

        return res.status(HTTP_STATUS.ok).json({
            status: "ok",
            service: SERVER.serviceName,
            datetime,
            database: {
                status: "connected",
            },
        });
    });
}

export default new HealthController();
