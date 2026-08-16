export type IProjectStatus = 'Planned' | 'Active' | 'Paused' | 'Closed';
export type ISprintStatus = 'Planned' | 'Active' | 'Closed' | 'Cancelled';
export type ITaskStatus = 'ToDo' | 'InProgress' | 'Done';
export type IBlockerStatus = 'Active' | 'Resolved';

export interface IProject {
    id: string;
    code: string;
    name: string;
    status: IProjectStatus;
}

export interface ISprint {
    id: string;
    projectId: string;
    name: string;
    goal: string;
    startDate: Date;
    endDate: Date;
    status: ISprintStatus;
}

export interface ITask {
    id: string;
    projectId: string;
    sprintId: string;
    code: string;
    title: string;
    status: ITaskStatus;
    ownerName: string;
    blocked: boolean;
    updatedAt: Date;
}

export interface IBlocker {
    id: string;
    projectId: string;
    sprintId: string;
    taskId: string;
    title: string;
    status: IBlockerStatus;
    ownerName: string;
    createdAt: Date;
}

export interface ITaskKPIs {
    plannedTasks: number;
    toDoTasks: number;
    inProgressTasks: number;
    doneTasks: number;
}

export interface IKPIs extends ITaskKPIs {
    completionRate: number;
    activeBlockers: number;
}

export type TMissionControlResponse = {
    schemaVersion: "1.0";
    project: IProject;
    sprint: ISprint;
    tasks: ITask[];
    activeBlockers: IBlocker[];
    kpis: IKPIs;
}