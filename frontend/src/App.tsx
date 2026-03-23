import React, { useState, useEffect, useCallback } from 'react';
import { type Task, type TaskCreate, Status, Priority } from './types';
import { getTasks, createTask, updateTask, deleteTask, getAISortedTasks, getAISummary } from './api';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Dashboard from './components/Dashboard';
import { Layout, CheckSquare, BarChart3, Sparkles, Filter, Loader2 } from 'lucide-react';

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [view, setView] = useState<'tasks' | 'dashboard' | 'ai'>('tasks');
    const [isLoading, setIsLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCreateTask = async (task: TaskCreate) => {
        try {
            await createTask(task);
            fetchTasks();
        } catch (error) {
            console.error('Failed to create task', error);
        }
    };

    const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
        try {
            await updateTask(id, updates);
            fetchTasks();
        } catch (error) {
            console.error('Failed to update task', error);
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await deleteTask(id);
            fetchTasks();
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const handleAiSort = async () => {
        setIsAiLoading(true);
        try {
            const sortedIds = await getAISortedTasks();
            const sortedTasks = [...tasks].sort((a, b) => {
                const indexA = sortedIds.indexOf(a.id);
                const indexB = sortedIds.indexOf(b.id);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
            setTasks(sortedTasks);
        } catch (error) {
            console.error('AI sorting failed', error);
            alert('AI sorting failed.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleFetchAiSummary = async () => {
        setIsAiLoading(true);
        try {
            const data = await getAISummary();
            setAiSummary(data.summary);
            setView('ai');
        } catch (error) {
            console.error('Failed to get AI summary', error);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white w-full">
            <header className="bg-[#1e1e1e] border-b border-[#333] p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-8 h-8 text-blue-500" />
                    <h1 className="text-2xl font-bold tracking-tight">TASK MANAGER</h1>
                </div>
                <nav className="flex gap-4">
                    <button 
                        onClick={() => setView('tasks')}
                        className={`flex items-center gap-1 px-4 py-2 rounded transition-colors ${view === 'tasks' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Layout className="w-4 h-4" /> Tasks
                    </button>
                    <button 
                        onClick={() => setView('dashboard')}
                        className={`flex items-center gap-1 px-4 py-2 rounded transition-colors ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <BarChart3 className="w-4 h-4" /> Dashboard
                    </button>
                    <button 
                        onClick={handleFetchAiSummary}
                        disabled={isAiLoading}
                        className={`flex items-center gap-1 px-4 py-2 rounded transition-colors ${view === 'ai' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Insights
                    </button>
                </nav>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8">
                {view === 'tasks' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <TaskForm onTaskCreated={handleCreateTask} />
                        </div>
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Your Tasks</h2>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleAiSort}
                                        disabled={isAiLoading}
                                        className="flex items-center gap-2 bg-[#1e1e1e] border border-[#333] px-4 py-2 rounded hover:border-blue-500 transition-colors text-sm"
                                    >
                                        {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
                                        AI Priority Sort
                                    </button>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-12 bg-[#1e1e1e] rounded-lg border border-dashed border-[#333]">
                                    <p className="text-gray-500">No tasks found. Use the AI input or form to add some!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {tasks.map(task => (
                                        <TaskCard 
                                            key={task.id} 
                                            task={task} 
                                            onUpdate={handleUpdateTask} 
                                            onDelete={handleDeleteTask} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'dashboard' && (
                    <Dashboard tasks={tasks} />
                )}

                {view === 'ai' && (
                    <div className="bg-[#1e1e1e] p-8 rounded-lg border border-blue-900 shadow-lg shadow-blue-900/10">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="w-8 h-8 text-blue-400" />
                            <h2 className="text-3xl font-bold">AI Weekly Insights</h2>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            {aiSummary ? (
                                <div className="whitespace-pre-wrap leading-relaxed text-gray-300 bg-[#121212] p-6 rounded border border-[#333]">
                                    {aiSummary}
                                </div>
                            ) : (
                                <p className="text-gray-500">Generating insights...</p>
                            )}
                        </div>
                        <button 
                            onClick={() => setView('tasks')}
                            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition-colors"
                        >
                            Back to Tasks
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
