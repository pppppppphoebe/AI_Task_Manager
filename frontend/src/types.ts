export enum Priority {
    HIGH = "High",
    MEDIUM = "Medium",
    LOW = "Low"
}

export enum Status {
    TODO = "Todo",
    IN_PROGRESS = "InProgress",
    DONE = "Done"
}

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
