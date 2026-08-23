import { ERROR_CODES } from "../config/constants";
import { prisma } from "../lib/prisma";
import { ITask } from "../types/mission.types";

class TaskService {
  async updateStatus(taskId: string): Promise<ITask | string | null> {
    const [task, blocked] = await Promise.all([
      await prisma.task.findFirst({ where: { id: taskId } }),
      await prisma.blocker.findFirst({ where: { task_id: taskId } }),
    ]);

    if (!task) return null;
    if (task.status !== "ToDo") return ERROR_CODES.invalidTransition;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: "InProgress" },
    });

    return {
      code: updatedTask.code,
      id: updatedTask.id,
      ownerName: updatedTask.owner_name ?? "",
      projectId: updatedTask.project_id,
      sprintId: updatedTask.sprint_id ?? "",
      status: updatedTask.status,
      title: updatedTask.title,
      updatedAt: updatedTask.updated_at,
      blocked: blocked ? true : false,
    };
  }
}

export default new TaskService();
