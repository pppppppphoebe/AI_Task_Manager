import React, { useState } from 'react';
import { type TimeBlock, type Task } from '../types';
import { Check, X } from 'lucide-react';

interface FeedbackModalProps {
    block: TimeBlock;
    task?: Task;
    onClose: () => void;
    onSubmit: (blockId: number, taskId: number | undefined, newRemaining: number) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ block, task, onClose, onSubmit }) => {
    // If it's a surprise task without a task_id, we don't have remaining workload to track.
    const initialRemaining = task ? Math.max(0, task.remaining_workload - block.duration_hours) : 0;
    const [remainingHours, setRemainingHours] = useState(initialRemaining);
    
    // For slider calculation (visual only)
    const initialProgress = task && task.total_workload > 0 
        ? Math.round(((task.total_workload - initialRemaining) / task.total_workload) * 100) 
        : 100;
    const [progress, setProgress] = useState(initialProgress);

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newProg = parseInt(e.target.value);
        setProgress(newProg);
        if (task) {
            const calculatedRemaining = task.total_workload * (1 - newProg / 100);
            setRemainingHours(parseFloat(calculatedRemaining.toFixed(1)));
        }
    };

    const handleRemainingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRem = parseFloat(e.target.value);
        setRemainingHours(newRem);
        if (task && task.total_workload > 0) {
            const calculatedProg = Math.max(0, Math.min(100, Math.round(((task.total_workload - newRem) / task.total_workload) * 100)));
            setProgress(calculatedProg);
        }
    };

    const handleSubmit = () => {
        onSubmit(block.id, task?.id, remainingHours);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">Complete Time Block</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Block Finished</p>
                        <p className="text-lg font-medium text-slate-800">{block.title} <span className="text-blue-500 font-bold">({block.duration_hours}h)</span></p>
                    </div>

                    {task ? (
                        <>
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-bold text-slate-700">Overall Project Progress</label>
                                        <span className="text-blue-600 font-bold">{progress}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={progress}
                                        onChange={handleProgressChange}
                                        className="w-full accent-blue-600"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 flex justify-between">
                                        <span>Adjust Remaining Hours</span>
                                        <span className="text-slate-400 font-normal">Total Est: {task.total_workload}h</span>
                                    </label>
                                    <div className="mt-2 flex items-center gap-3">
                                        <input 
                                            type="number" 
                                            min="0" step="0.5"
                                            value={remainingHours}
                                            onChange={handleRemainingChange}
                                            className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500 text-center"
                                        />
                                        <span className="text-slate-500 text-sm">hours left</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        System guessed {initialRemaining}h based on your scheduled time. Adjust this if you encountered blockers or finished early!
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-slate-500 italic">This was a standalone/surprise block. Great job completing it!</p>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" /> Confirm & Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
