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
            status: Status.TODO
        });
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPriority(Priority.MEDIUM);
        setWorkload(1);
        setDeadline('');
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
        <div className="bg-[#1e1e1e] p-6 rounded-lg border border-[#333] mb-8">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                Add New Task
            </h2>
            
            <div className="mb-6 pb-6 border-b border-[#333]">
                <label className="block text-gray-400 text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    AI Natural Language Input
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="e.g., 'Finish project report by Friday noon with high priority'"
                        className="flex-1 bg-[#121212] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAiParse()}
                    />
                    <button 
                        onClick={handleAiParse}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Parse
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    AI will automatically fill the form below.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-1">Title</label>
                    <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-1">Description</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-20"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-1">Priority</label>
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-1">Deadline</label>
                    <input 
                        type="datetime-local" 
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-1">Estimated Hours</label>
                    <input 
                        type="number" 
                        value={workload}
                        onChange={(e) => setWorkload(parseInt(e.target.value))}
                        className="w-full bg-[#121212] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <button 
                        type="button"
                        onClick={resetForm}
                        className="text-gray-400 hover:text-white px-4 py-2"
                    >
                        Reset
                    </button>
                    <button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition-colors"
                    >
                        Create Task
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;
