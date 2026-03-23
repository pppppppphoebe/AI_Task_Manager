import React from 'react';
import { type Task, Status } from '../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface DashboardProps {
    tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
    const statusCounts = {
        [Status.TODO]: tasks.filter(t => t.status === Status.TODO).length,
        [Status.IN_PROGRESS]: tasks.filter(t => t.status === Status.IN_PROGRESS).length,
        [Status.DONE]: tasks.filter(t => t.status === Status.DONE).length,
    };

    const doughnutData = {
        labels: ['Todo', 'In Progress', 'Done'],
        datasets: [
            {
                label: '# of Tasks',
                data: [statusCounts[Status.TODO], statusCounts[Status.IN_PROGRESS], statusCounts[Status.DONE]],
                backgroundColor: [
                    '#cbd5e1', // slate-300
                    '#fbbf24', // amber-400
                    '#10b981', // emerald-500
                ],
                borderWidth: 0,
                hoverOffset: 10
            },
        ],
    };

    // Calculate workload per priority
    const workloadData = {
        labels: ['Low', 'Medium', 'High'],
        datasets: [
            {
                label: 'Total Workload (Hours)',
                data: [
                    tasks.filter(t => t.priority === 'Low').reduce((acc, t) => acc + t.workload, 0),
                    tasks.filter(t => t.priority === 'Medium').reduce((acc, t) => acc + t.workload, 0),
                    tasks.filter(t => t.priority === 'High').reduce((acc, t) => acc + t.workload, 0),
                ],
                backgroundColor: '#3b82f6', // blue-500
                borderRadius: 8,
                barThickness: 40,
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Task Status Distribution</h3>
                <div className="h-64 flex justify-center">
                    <Doughnut 
                        data={doughnutData} 
                        options={{ 
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true,
                                        font: { size: 12, weight: 'bold' }
                                    }
                                }
                            }
                        }} 
                    />
                </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 text-slate-800">Workload by Priority</h3>
                <div className="h-64 flex justify-center">
                    <Bar 
                        data={workloadData} 
                        options={{ 
                            maintainAspectRatio: false, 
                            plugins: { 
                                legend: { display: false } 
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: { display: false },
                                    ticks: { font: { size: 11 } }
                                },
                                x: {
                                    grid: { display: false },
                                    ticks: { font: { size: 11, weight: 'bold' } }
                                }
                            }
                        }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
