import Joi from "joi";
import { TMissionControlRequest } from "../types/mission.types";

export const MissionControlDashboardQuery = Joi.object<TMissionControlRequest>({
    team_id: Joi.string()
        .trim()
        .uuid({ version: 'uuidv4' })
        .required()
        .messages({
            "any.required": "team_id is required",
            "string.empty": "team_id is required",
            "string.guid": "team_id must be a valid UUID",
        }),
});