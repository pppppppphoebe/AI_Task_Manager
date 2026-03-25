import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type Task, type TaskCreate, type TimeBlock } from './types';
import { getTasks, createTask, updateTask, deleteTask, getAISortedTasks, getAISummary, getTimeBlocks } from './api';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import DailySchedule from './components/DailySchedule';
import FeedbackModal from './components/FeedbackModal';
import { Layout, CheckSquare, BarChart3, Sparkles, Filter, Loader2, Calendar, Clock } from 'lucide-react';
import { generateDailySchedule, checkGoogleStatus, syncGoogleCalendar, getGoogleLoginUrl } from './api';

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
    const [view, setView] = useState<'tasks' | 'dashboard' | 'ai' | 'calendar' | 'schedule'>('tasks');
    const [isLoading, setIsLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    
    // Daily Schedule State
    const [activeBlock, setActiveBlock] = useState<TimeBlock | null>(null);

    const checkGoogle = async () => {
        try {
            const status = await checkGoogleStatus();
            setIsGoogleConnected(status.connected);
        } catch (e) {
            console.error("Google status check failed", e);
        }
    };

    useEffect(() => {
        checkGoogle();
        
        // Check for oauth success callback param
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('google_sync') === 'success') {
            alert('Google Calendar Connected Successfully!');
            window.history.replaceState({}, document.title, window.location.pathname);
            checkGoogle();
        }
    }, []);

    const handleConnectGoogle = async () => {
        try {
            const data = await getGoogleLoginUrl();
            window.location.href = data.url;
        } catch (error) {
            console.error('Failed to get Google login URL', error);
            alert('Failed to connect to Google Auth service.');
        }
    };

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tasksData, blocksData] = await Promise.all([
                getTasks(),
                getTimeBlocks()
            ]);
            setTasks(tasksData);
            setTimeBlocks(blocksData);
        } catch (error) {
            console.error('Failed to fetch data', error);
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

    const handleGenerateSchedule = async (hours: number) => {
        setIsAiLoading(true);
        try {
            // First sync with Google Calendar to get latest context
            if (isGoogleConnected) {
                await syncGoogleCalendar();
            }

            // Get local current time string in format expected by backend (YYYY-MM-DD HH:MM:SS)
            const tzoffset = (new Date()).getTimezoneOffset() * 60000;
            const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
            
            await generateDailySchedule(hours, localISOTime);
            fetchTasks(); 
        } catch (error) {
            console.error('Failed to generate schedule', error);
            alert('Failed to generate schedule.');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleCompleteBlock = (block: TimeBlock) => {
        setActiveBlock(block);
    };

    const handleSubmitFeedback = async (blockId: number, taskId: number | undefined, newRemaining: number) => {
        if (taskId) {
            await handleUpdateTask(taskId, { remaining_workload: newRemaining });
        }
        
        // Refresh all data
        fetchTasks();
        setActiveBlock(null);
    };

    // Filter blocks for today specifically for the schedule view
    const todayBlocksForView = useMemo(() => {
        const todayDate = new Date();
        const tzoffset = todayDate.getTimezoneOffset() * 60000;
        const localISODate = (new Date(todayDate.getTime() - tzoffset)).toISOString().split('T')[0];
        return timeBlocks.filter(b => b.date === localISODate);
    }, [timeBlocks]);

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
                        onClick={isGoogleConnected ? async () => { alert((await syncGoogleCalendar()).message); fetchTasks(); } : handleConnectGoogle}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${isGoogleConnected ? 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'border-blue-200 text-blue-600 bg-white hover:bg-blue-50 shadow-sm'}`}
                    >
                        <Calendar className="w-4 h-4" /> 
                        {isGoogleConnected ? 'Sync GCal' : 'Connect GCal'}
                    </button>
                    <div className="w-px h-8 bg-slate-200 mx-2 self-center"></div>
                    <button 
                        onClick={() => setView('tasks')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'tasks' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Layout className="w-4 h-4" /> Tasks
                    </button>
                    <button 
                        onClick={() => setView('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Calendar className="w-4 h-4" /> Calendar
                    </button>
                    <button 
                        onClick={() => setView('schedule')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'schedule' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Clock className="w-4 h-4" /> Today
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

                {view === 'calendar' && (
                    <CalendarView 
                        tasks={tasks} 
                        timeBlocks={timeBlocks} 
                    />
                )}

                {view === 'schedule' && (
                    <DailySchedule 
                        blocks={todayBlocksForView}
                        onGenerate={handleGenerateSchedule}
                        onCompleteBlock={handleCompleteBlock}
                        isLoading={isAiLoading}
                    />
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
            
            {activeBlock && (
                <FeedbackModal 
                    block={activeBlock}
                    task={tasks.find(t => t.id === activeBlock.task_id)}
                    onClose={() => setActiveBlock(null)}
                    onSubmit={handleSubmitFeedback}
                />
            )}
        </div>
    );
};

export default App;
