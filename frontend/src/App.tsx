import React, { useState, useEffect, useCallback } from 'react';
import { type Task, type TaskCreate } from './types';
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
                
                // If ID is missing from AI response, put it at the end
                if (indexA === -1 && indexB === -1) return 0;
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
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 w-full font-sans">
            <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <CheckSquare className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">TaskFlow AI</h1>
                </div>
                <nav className="flex gap-2">
                    <button 
                        onClick={() => setView('tasks')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'tasks' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Layout className="w-4 h-4" /> Tasks
                    </button>
                    <button 
                        onClick={() => setView('dashboard')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <BarChart3 className="w-4 h-4" /> Dashboard
                    </button>
                    <button 
                        onClick={handleFetchAiSummary}
                        disabled={isAiLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'ai' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Sparkles className="w-4 h-4 text-blue-500" />} AI Insights
                    </button>
                </nav>
            </header>

            <main className="max-w-6xl mx-auto p-6 md:p-10">
                {view === 'tasks' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4">
                            <TaskForm onTaskCreated={handleCreateTask} />
                        </div>
                        <div className="lg:col-span-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800">Your Tasks</h2>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleAiSort}
                                        disabled={isAiLoading}
                                        className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-medium shadow-sm"
                                    >
                                        {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-500" />}
                                        AI Priority Sort
                                    </button>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Filter className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No tasks found. Use the AI input to get started!</p>
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
                    <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-xl shadow-blue-500/5">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-blue-100 p-3 rounded-2xl">
                                <Sparkles className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800">AI Weekly Insights</h2>
                        </div>
                        <div className="prose prose-slate max-w-none">
                            {aiSummary ? (
                                <div className="whitespace-pre-wrap leading-relaxed text-slate-600 bg-slate-50 p-8 rounded-2xl border border-slate-100 italic">
                                    {aiSummary}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating insights...
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => setView('tasks')}
                            className="mt-10 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
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
