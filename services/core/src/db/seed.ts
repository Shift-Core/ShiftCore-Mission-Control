import { TEAM_ID } from "../config/constants";
import {
  BlockerStatus,
  ProjectStatus,
  SprintStatus,
  TaskStatus,
} from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const PROJECT_ID = "prj_demo";
const SPRINT_ID = "spr_demo";

async function seed(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.project.upsert({
      where: { id: PROJECT_ID },
      update: {
        team_id: TEAM_ID,
        code: "SMC",
        name: "ShiftCore Mission Control",
        status: ProjectStatus.Active,
      },
      create: {
        id: PROJECT_ID,
        team_id: TEAM_ID,
        code: "SMC",
        name: "ShiftCore Mission Control",
        status: ProjectStatus.Active,
      },
    });

    await tx.sprint.upsert({
      where: { id: SPRINT_ID },
      update: {
        project_id: PROJECT_ID,
        name: "MVP Sprint",
        goal: "Deliver the Mission Control MVP",
        start_date: new Date("2026-08-17T00:00:00.000Z"),
        end_date: new Date("2026-08-24T00:00:00.000Z"),
        status: SprintStatus.Active,
      },
      create: {
        id: SPRINT_ID,
        project_id: PROJECT_ID,
        name: "MVP Sprint",
        goal: "Deliver the Mission Control MVP",
        start_date: new Date("2026-08-17T00:00:00.000Z"),
        end_date: new Date("2026-08-24T00:00:00.000Z"),
        status: SprintStatus.Active,
      },
    });

    const tasks = [
      {
        id: "tsk_todo",
        code: "SMC-101",
        title: "Build mission-control board endpoint",
        status: TaskStatus.ToDo,
      },
      {
        id: "tsk_in_progress",
        code: "SMC-102",
        title: "Implement task status transition",
        status: TaskStatus.InProgress,
      },
      {
        id: "tsk_done",
        code: "SMC-95",
        title: "Prepare Core service scaffold",
        status: TaskStatus.Done,
      },
    ];

    for (const task of tasks) {
      await tx.task.upsert({
        where: { id: task.id },
        update: {
          project_id: PROJECT_ID,
          sprint_id: SPRINT_ID,
          code: task.code,
          title: task.title,
          status: task.status,
          owner_name: null,
        },
        create: {
          ...task,
          project_id: PROJECT_ID,
          sprint_id: SPRINT_ID,
          owner_name: null,
        },
      });
    }

    await tx.blocker.upsert({
      where: { id: "blk_demo" },
      update: {
        project_id: PROJECT_ID,
        sprint_id: SPRINT_ID,
        task_id: "tsk_in_progress",
        title: "Core API contract approval pending",
        status: BlockerStatus.Active,
        owner_name: null,
      },
      create: {
        id: "blk_demo",
        project_id: PROJECT_ID,
        sprint_id: SPRINT_ID,
        task_id: "tsk_in_progress",
        title: "Core API contract approval pending",
        status: BlockerStatus.Active,
        owner_name: null,
      },
    });
  });

  console.log("Core demo seed applied", {
    projectId: PROJECT_ID,
    sprintId: SPRINT_ID,
    tasks: 3,
    activeBlockers: 1,
  });
}

try {
  await seed();
} catch (error) {
  console.error("Core demo seed failed", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
