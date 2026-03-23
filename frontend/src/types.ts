export const Priority = {
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low"
} as const;
export type Priority = typeof Priority[keyof typeof Priority];

export const Status = {
    TODO: "Todo",
    IN_PROGRESS: "InProgress",
    DONE: "Done"
} as const;
export type Status = typeof Status[keyof typeof Status];

export interface Task {
    id: number;
    title: string;
    description?: string;
    deadline?: string;
    priority: Priority;
    status: Status;
    workload: number;
    is_daily: boolean;
    created_at: string;
}

export interface TaskCreate {
    title: string;
    description?: string;
    deadline?: string;
    priority: Priority;
    status: Status;
    workload: number;
    is_daily?: boolean;
}
