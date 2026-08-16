import { prisma } from "../lib/prisma";
import { TMissionControlResponse } from "../types/mission.types";

class MissionControlService {
    async fetchDashboardData(): Promise<TMissionControlResponse | null> {
        const project = await prisma.project.findFirst()
        if (!project) return null;

        const [sprint, tasks] = await Promise.all([
            prisma.sprint.findFirst({
                where: {
                    project_id: project.id,
                },
            }),

            prisma.task.findMany({
                where: {
                    project_id: project.id
                }
            })
        ])

        if (!sprint) return null;

        const tasksIds = tasks.map(({ id }) => id)

        const blockers = tasks.length
            ? await prisma.blocker.findMany({
                where: {
                    task_id: {
                        in: tasksIds
                    }
                },

            })
            : [];

        const blockerTaskIds = new Set(
            blockers
                .map(({ task_id }) => task_id)
                .filter((id): id is string => id !== null)
        );

        const tasksKPIs = {
            plannedTasks: 0,
            toDoTasks: 0,
            inProgressTasks: 0,
            doneTasks: 0,
        };

        for (const task of tasks) {
            switch (task.status) {
                case "ToDo":
                    tasksKPIs.toDoTasks++;
                    break;

                case "InProgress":
                    tasksKPIs.inProgressTasks++;
                    break;

                case "Done":
                    tasksKPIs.doneTasks++;
                    break;
            }
        }

        const kpis = {
            ...tasksKPIs,

            completionRate:
                tasks.length > 0
                    ? Number(((tasksKPIs.doneTasks * 100) / tasks.length).toFixed(2))
                    : 0,

            activeBlockers: blockers.length,
        };

        return {
            schemaVersion: '1.0',
            project: {
                id: project.id,
                code: project.code,
                name: project.name,
                status: project.status
            },
            sprint: {
                id: sprint.id,
                name: sprint.name,
                projectId: sprint.project_id,
                status: sprint.status,
                goal: sprint.goal,
                startDate: sprint.start_date,
                endDate: sprint.end_date
            },
            tasks: tasks.map(({
                code,
                id,
                owner_name,
                project_id,
                sprint_id,
                status,
                title,
                updated_at,
            }) => ({
                code,
                id,
                ownerName: owner_name ?? '',
                projectId: project_id,
                sprintId: sprint_id as string,
                status,
                title,
                updatedAt: updated_at,
                blocked: blockerTaskIds.has(id)
            })),
            activeBlockers: blockers.map(({ created_at, id, owner_name, project_id, sprint_id, status, task_id, title, updated_at }) => ({
                createdAt: created_at,
                id,
                ownerName: owner_name ?? '',
                projectId: project_id.toString() ?? '',
                sprintId: sprint_id?.toString() ?? '',
                status,
                taskId: task_id?.toString() ?? '',
                title,
            })),
            kpis
        }
    }
};

export default new MissionControlService();