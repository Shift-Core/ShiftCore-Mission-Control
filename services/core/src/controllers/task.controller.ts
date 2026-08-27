import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { sendError, sendSuccess } from "../utils/response";
import { ERROR_CODES, HTTP_STATUS } from "../config/constants";
import { ITask } from "../types/mission.types";
import { TErrorResponse, TSuccessResponse } from "../types";
import taskService from "../services/task.service";
import { AppError } from "../utils/app-error";

class TasksController {
  readonly status = asyncHandler(
    async (
      req: Request<{ id: string }>,
      res: Response<TSuccessResponse<ITask | null> | TErrorResponse>,
    ) => {
      const taskId = req.params.id;
      const updatedTask = await taskService.updateStatus(taskId);

      if (!updatedTask) throw AppError.notFound();

      if (
        updatedTask === ERROR_CODES.invalidTransition &&
        typeof updatedTask === "string"
      )
        return sendError({
          req,
          res,
          errorCode: ERROR_CODES.invalidTransition,
          message: "You can only update 'ToDo' tasks",
          statusCode: HTTP_STATUS.conflict,
        });

      return sendSuccess({
        res: res,
        message: "Task updated to InProgress",
        data: updatedTask as ITask,
        statusCode: HTTP_STATUS.ok,
      });
    },
  );
}

export default new TasksController();
