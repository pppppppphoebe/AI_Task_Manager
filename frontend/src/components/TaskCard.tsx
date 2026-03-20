import React from 'react';
import { type Task, Priority, Status } from '../types';
import { Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
    task: Task;
    onUpdate: (id: number, updates: Partial<Task>) => void;
    onDelete: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
    const priorityColor = {
        [Priority.HIGH]: 'bg-red-500',
        [Priority.MEDIUM]: 'bg-yellow-500',
        [Priority.LOW]: 'bg-blue-500',
    };

    const statusIcon = {
        [Status.TODO]: <Clock className="w-5 h-5 text-gray-400" />,
        [Status.IN_PROGRESS]: <AlertCircle className="w-5 h-5 text-yellow-400" />,
        [Status.DONE]: <CheckCircle className="w-5 h-5 text-green-400" />,
    };

    return (
        <div className="bg-[#1e1e1e] p-4 rounded-lg border border-[#333] mb-4 flex flex-col hover:border-blue-500 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {statusIcon[task.status]}
                    <h3 className={`text-lg font-semibold ${task.status === Status.DONE ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                    </h3>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onDelete(task.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {task.description && (
                <p className="text-gray-400 text-sm mb-3">
                    {task.description}
                </p>
            )}

            <div className="flex flex-wrap gap-2 mt-auto text-xs">
                <span className={`${priorityColor[task.priority]} text-black px-2 py-1 rounded font-bold`}>
                    {task.priority}
                </span>
                <span className="bg-[#333] text-gray-300 px-2 py-1 rounded">
                    {task.workload}h
                </span>
                {task.deadline && (
                    <span className="bg-[#333] text-gray-300 px-2 py-1 rounded flex items-center gap-1">
                        Due: {format(new Date(task.deadline), 'MMM d, p')}
                    </span>
                )}
            </div>

            <div className="flex gap-2 mt-4">
                {task.status !== Status.DONE && (
                    <button 
                        onClick={() => onUpdate(task.id, { status: Status.DONE })}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        Mark Done
                    </button>
                )}
                {task.status === Status.TODO && (
                    <button 
                        onClick={() => onUpdate(task.id, { status: Status.IN_PROGRESS })}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        Start Work
                    </button>
                )}
                {task.status === Status.IN_PROGRESS && (
                    <button 
                        onClick={() => onUpdate(task.id, { status: Status.TODO })}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        Pause
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
