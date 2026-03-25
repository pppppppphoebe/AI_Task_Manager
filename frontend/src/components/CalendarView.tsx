import React, { useState } from 'react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    isSameMonth, 
    isSameDay, 
    eachDayOfInterval,
    isToday,
    parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sparkles, Target } from 'lucide-react';
import { type Task, type TimeBlock, Priority } from '../types';

interface CalendarViewProps {
    tasks: Task[];
    timeBlocks?: TimeBlock[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, timeBlocks = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-8 px-4 py-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-600 border border-blue-50">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {format(currentMonth, 'MMMM')} <span className="text-slate-400 font-light">{format(currentMonth, 'yyyy')}</span>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        <button 
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-slate-50 rounded-lg transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <button 
                            onClick={() => setCurrentMonth(new Date())}
                            className="px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-slate-50 rounded-lg transition-all text-slate-600"
                        >
                            Today
                        </button>
                        <button 
                            onClick={nextMonth}
                            className="p-2 hover:bg-slate-50 rounded-lg transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-4">
                {days.map(day => (
                    <div key={day} className="text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pb-2">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({
            start: startDate,
            end: endDate
        });

        return (
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
                {calendarDays.map((day, idx) => {
                    const dayTasks = tasks.filter(task => {
                        if (!task.deadline) return false;
                        return isSameDay(parseISO(task.deadline), day);
                    });

                    const dayBlocks = timeBlocks.filter(block => {
                        return isSameDay(parseISO(block.date), day);
                    });

                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);

                    return (
                        <div 
                            key={idx} 
                            className={`min-h-[140px] p-2 transition-all group relative ${
                                isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-300'
                            } hover:bg-blue-50/30`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                                    isTodayDate 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110' 
                                        : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                                }`}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="space-y-1.5 overflow-hidden">
                                {/* Tasks (Blue Targets) */}
                                {dayTasks.map(task => (
                                    <div 
                                        key={`task-${task.id}`} 
                                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 border-l-4 border-blue-500 text-blue-700 shadow-sm"
                                    >
                                        <Target className="w-2.5 h-2.5 shrink-0" />
                                        <span className="text-[10px] font-bold truncate leading-tight">{task.title}</span>
                                    </div>
                                ))}

                                {/* TimeBlocks (Fixed = Red, AI = Emerald) */}
                                {dayBlocks.map(block => {
                                    const isFixed = block.is_fixed;
                                    const isAllDay = block.is_all_day;
                                    
                                    if (isFixed) {
                                        return (
                                            <div 
                                                key={`block-${block.id}`} 
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg shadow-sm ${
                                                    isAllDay 
                                                    ? 'bg-amber-50 border-l-4 border-amber-400 text-amber-700' 
                                                    : 'bg-red-50 border-l-4 border-red-400 text-red-700'
                                                }`}
                                            >
                                                {isAllDay ? <Sparkles className="w-2.5 h-2.5 shrink-0" /> : <Clock className="w-2.5 h-2.5 shrink-0" />}
                                                <span className="text-[10px] font-bold truncate leading-tight">
                                                    {!isAllDay && block.start_time && format(parseISO(block.start_time), 'HH:mm ')}
                                                    {block.title}
                                                </span>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div 
                                                key={`block-${block.id}`} 
                                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 shadow-sm animate-pulse-slow"
                                            >
                                                <Sparkles className="w-2.5 h-2.5 shrink-0" />
                                                <span className="text-[10px] font-bold truncate leading-tight">{block.title}</span>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                            
                            {/* Decorative dot if cell is very full */}
                            {(dayTasks.length + dayBlocks.length) > 4 && (
                                <div className="absolute bottom-1 right-2 w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderHeader()}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60">
                {renderDays()}
                {renderCells()}
            </div>
            
            {/* Legend */}
            <div className="mt-8 flex justify-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span>Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-400"></div>
                    <span>Google Calendar</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-400"></div>
                    <span>Special Events</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500"></div>
                    <span>AI Scheduled</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
