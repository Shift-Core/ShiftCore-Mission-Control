import type { Request, Response } from "express";
import {
    ERROR_CODES,
    HTTP_STATUS,
} from "../config/constants";
import type { TErrorResponse } from "../types";
import { sendError } from "./response";

class NotImplementedHandler {
    private getEndpoint(req: Request): string {
        const routePath = req.route.path === "/" ? "" : req.route.path;

        return `${req.method} ${req.baseUrl}${routePath}`;
    }

    readonly handle = (
        req: Request,
        res: Response<TErrorResponse>,
    ) => {
        const endpoint = this.getEndpoint(req);

        return sendError({
            req,
            res,
            statusCode: HTTP_STATUS.notImplemented,
            errorCode: ERROR_CODES.notImplemented,
            message: `${endpoint} is not implemented yet`,
        });
    };
}

export default new NotImplementedHandler();
