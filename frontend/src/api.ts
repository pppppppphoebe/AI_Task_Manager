import axios from 'axios';
import { type Task, type TaskCreate, Priority, Status } from './types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const getTasks = async (status?: Status, priority?: Priority) => {
    const response = await api.get<Task[]>('/tasks', { params: { status, priority } });
    return response.data;
};

export const createTask = async (task: TaskCreate) => {
    const response = await api.post<Task[]>('/tasks', task);
    return response.data;
};

export const updateTask = async (id: number, task: Partial<Task>) => {
    const response = await api.put<Task>(`/tasks/${id}`, task);
    return response.data;
};

export const getTimeBlocks = async () => {
    const response = await api.get<TimeBlock[]>('/time_blocks');
    return response.data;
};

export const deleteTask = async (id: number) => {
    await api.delete(`/tasks/${id}`);
};

// AI APIs
export const parseTask = async (text: string) => {
    const response = await api.post('/ai/parse', null, { params: { text } });
    return response.data;
};

export const getAISortedTasks = async () => {
    const response = await api.get<number[]>('/ai/sort');
    return response.data;
};

export const getAISummary = async () => {
    const response = await api.get<{ summary: string }>('/ai/summary');
    return response.data;
};

export const generateDailySchedule = async (availableHours: number, currentTime: string) => {
    const response = await api.post('/ai/schedule/today', {
        available_hours: availableHours,
        current_time: currentTime
    });
    return response.data;
};

// Google APIs
export const checkGoogleStatus = async () => {
    const response = await api.get<{ connected: boolean }>('/auth/google/status');
    return response.data;
};

export const syncGoogleCalendar = async () => {
    const response = await api.post('/calendar/sync');
    return response.data;
};

export const getGoogleLoginUrl = async () => {
    const response = await api.get<{ url: string }>('/auth/google/login');
    return response.data;
};

export default api;
