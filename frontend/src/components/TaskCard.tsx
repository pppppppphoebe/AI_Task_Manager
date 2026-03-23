import React, { useState } from 'react';
import { type Task, Priority, Status } from '../types';
import { Trash2, CheckCircle, Clock, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
    task: Task;
    onUpdate: (id: number, updates: Partial<Task>) => void;
    onDelete: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');

    const handleUpdate = () => {
        onUpdate(task.id, { title: editTitle, description: editDescription });
        setIsEditing(false);
    };

    const priorityColor = {
        [Priority.HIGH]: 'bg-red-50 text-red-600 border-red-100',
        [Priority.MEDIUM]: 'bg-amber-50 text-amber-600 border-amber-100',
        [Priority.LOW]: 'bg-blue-50 text-blue-600 border-blue-100',
    };

    const statusIcon = {
        [Status.TODO]: <Clock className="w-5 h-5 text-slate-400" />,
        [Status.IN_PROGRESS]: <AlertCircle className="w-5 h-5 text-amber-500" />,
        [Status.DONE]: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    };

    return (
        <div className={`bg-white p-5 rounded-2xl border transition-all hover:shadow-md ${task.status === Status.DONE ? 'border-slate-100 opacity-75' : 'border-slate-200 shadow-sm hover:border-blue-300'}`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="mt-0.5">
                        {statusIcon[task.status]}
                    </div>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="text-lg font-bold text-slate-800 border-b border-blue-500 outline-none w-full"
                        />
                    ) : (
                        <h3 className={`text-lg font-bold ${task.status === Status.DONE ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                        </h3>
                    )}
                </div>
                <div className="flex gap-1 ml-4">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={handleUpdate}
                                className="text-emerald-500 hover:bg-emerald-50 p-1 rounded-lg transition-all"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="text-slate-400 hover:bg-slate-50 p-1 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="text-slate-300 hover:text-blue-500 p-1 rounded-lg hover:bg-blue-50 transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => onDelete(task.id)}
                                className="text-slate-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="ml-8 mb-4">
                {isEditing ? (
                    <textarea 
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full text-slate-500 text-sm border rounded-lg p-2 mt-1 focus:border-blue-500 outline-none"
                    />
                ) : (
                    task.description && (
                        <p className="text-slate-500 text-sm">
                            {task.description}
                        </p>
                    )
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 ml-8 text-[11px] font-bold uppercase tracking-wider">
                <span className={`${priorityColor[task.priority]} border px-2 py-0.5 rounded-md`}>
                    {task.priority}
                </span>
                <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    {task.workload}h
                </span>
                {task.is_daily && (
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                        Daily
                    </span>
                )}
                {task.deadline && (
                    <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md">
                        Due: {format(new Date(task.deadline), 'MMM d, p')}
                    </span>
                )}
            </div>

            <div className="flex gap-2 mt-5 ml-8">
                {task.status !== Status.DONE && (
                    <button 
                        onClick={() => onUpdate(task.id, { status: Status.DONE })}
                        className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all"
                    >
                        Mark Done
                    </button>
                )}
                {task.status === Status.TODO && (
                    <button 
                        onClick={() => onUpdate(task.id, { status: Status.IN_PROGRESS })}
                        className="bg-amber-50 text-amber-600 hover:bg-amber-100 text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all"
                    >
                        Start Work
                    </button>
                )}
                {task.status === Status.IN_PROGRESS && (
                    <button 
                        onClick={() => onUpdate(task.id, { status: Status.TODO })}
                        className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all"
                    >
                        Pause
                    </button>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
