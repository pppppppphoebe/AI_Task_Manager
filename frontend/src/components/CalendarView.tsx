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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { type Task, Priority } from '../types';

interface CalendarViewProps {
    tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    // Fix for subMonths:
    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <button 
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-lg border border-slate-200 transition-all text-slate-600"
                    >
                        Today
                    </button>
                    <button 
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-2 border-b border-slate-100 pb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
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
            <div className="grid grid-cols-7 border-l border-t border-slate-100 rounded-xl overflow-hidden shadow-sm">
                {calendarDays.map((day, idx) => {
                    const dayTasks = tasks.filter(task => {
                        if (!task.deadline) return false;
                        return isSameDay(parseISO(task.deadline), day);
                    });

                    return (
                        <div 
                            key={idx} 
                            className={`min-h-[120px] bg-white border-r border-b border-slate-100 p-2 transition-all hover:bg-slate-50/50 ${
                                !isSameMonth(day, monthStart) ? 'bg-slate-50/30' : ''
                            }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                                    isToday(day) 
                                        ? 'bg-blue-600 text-white' 
                                        : !isSameMonth(day, monthStart) 
                                            ? 'text-slate-300' 
                                            : 'text-slate-600'
                                }`}>
                                    {format(day, 'd')}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded-md">
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1">
                                {dayTasks.slice(0, 3).map(task => (
                                    <div 
                                        key={task.id} 
                                        className="text-[10px] leading-tight p-1 rounded border-l-2 bg-slate-50 border-slate-200 truncate group relative"
                                        style={{ borderLeftColor: task.priority === Priority.HIGH ? '#ef4444' : task.priority === Priority.MEDIUM ? '#f59e0b' : '#3b82f6' }}
                                    >
                                        <span className="font-medium text-slate-700">{task.title}</span>
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-[9px] text-slate-400 font-bold pl-1">
                                        + {dayTasks.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

export default CalendarView;
