import React, { useState } from 'react';
import { Priority, Status, type TaskCreate } from '../types';
import { Sparkles, Loader2 } from 'lucide-react';
import { parseTask } from '../api';

interface TaskFormProps {
    onTaskCreated: (task: TaskCreate) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
    const [workload, setWorkload] = useState(1);
    const [deadline, setDeadline] = useState('');
    const [isDaily, setIsDaily] = useState(false);
    
    const [aiInput, setAiInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onTaskCreated({
            title,
            description,
            priority,
            workload,
            deadline: deadline || undefined,
            status: Status.TODO,
            is_daily: isDaily
        });
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPriority(Priority.MEDIUM);
        setWorkload(1);
        setDeadline('');
        setIsDaily(false);
    };

    const handleAiParse = async () => {
        if (!aiInput.trim()) return;
        setIsLoading(true);
        try {
            const data = await parseTask(aiInput);
            setTitle(data.title);
            setDescription(data.description || '');
            setPriority(data.priority);
            setWorkload(data.workload);
            setIsDaily(data.is_daily || false);
            if (data.deadline) {
                setDeadline(new Date(data.deadline).toISOString().slice(0, 16));
            }
            setAiInput('');
        } catch (error) {
            console.error('AI parsing failed', error);
            alert('AI parsing failed. Please try again or enter manually.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                Create New Task
            </h2>
            
            <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <label className="block text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Quick Add
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="e.g., 'Leetcode every day until 4/10'"
                        className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAiParse()}
                    />
                    <button 
                        onClick={handleAiParse}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-slate-500 text-xs font-semibold mb-1.5 ml-1">Title</label>
                    <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                </div>
                <div>
                    <label className="block text-slate-500 text-xs font-semibold mb-1.5 ml-1">Description</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all h-20 resize-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-500 text-xs font-semibold mb-1.5 ml-1">Priority</label>
                        <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        >
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-slate-500 text-xs font-semibold mb-1.5 ml-1">Workload (h)</label>
                        <input 
                            type="number" 
                            value={workload}
                            onChange={(e) => setWorkload(parseInt(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-slate-500 text-xs font-semibold mb-1.5 ml-1">Deadline</label>
                    <input 
                        type="datetime-local" 
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                </div>
                <div className="flex items-center py-2">
                    <label className="flex items-center text-slate-600 text-sm cursor-pointer group">
                        <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-all ${isDaily ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-200 group-hover:border-blue-400'}`}>
                            {isDaily && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <input 
                            type="checkbox" 
                            checked={isDaily}
                            onChange={(e) => setIsDaily(e.target.checked)}
                            className="hidden"
                        />
                        Repeat daily until deadline
                    </label>
                </div>
                <div className="pt-4 flex flex-col gap-2">
                    <button 
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg"
                    >
                        Create Task
                    </button>
                    <button 
                        type="button"
                        onClick={resetForm}
                        className="text-slate-400 hover:text-slate-600 text-xs font-medium py-2"
                    >
                        Clear form
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;
