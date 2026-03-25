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

export const BlockSource = {
    SYSTEM: "system",
    GOOGLE_CALENDAR: "google_calendar"
} as const;
export type BlockSource = typeof BlockSource[keyof typeof BlockSource];

export const BlockStatus = {
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "InProgress",
    COMPLETED: "Completed",
    REVIEWED: "Reviewed"
} as const;
export type BlockStatus = typeof BlockStatus[keyof typeof BlockStatus];

export interface TimeBlock {
    id: number;
    task_id?: number;
    title: string;
    date: string;
    start_time?: string;
    end_time?: string;
    duration_hours: number;
    source: BlockSource;
    is_fixed: boolean;
    is_all_day: boolean;
    google_event_id?: string;
    status: BlockStatus;
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    deadline?: string;
    priority: Priority;
    status: Status;
    total_workload: number;
    remaining_workload: number;
    is_daily: boolean;
    created_at: string;
    time_blocks?: TimeBlock[];
}

export interface TaskCreate {
    title: string;
    description?: string;
    deadline?: string;
    priority: Priority;
    status: Status;
    total_workload: number;
    remaining_workload: number;
    is_daily?: boolean;
}
