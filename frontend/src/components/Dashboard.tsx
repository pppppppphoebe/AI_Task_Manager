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
                    'rgba(156, 163, 175, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                ],
                borderColor: [
                    'rgba(156, 163, 175, 1)',
                    'rgba(234, 179, 8, 1)',
                    'rgba(34, 197, 94, 1)',
                ],
                borderWidth: 1,
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
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-[#1e1e1e] p-6 rounded-lg border border-[#333]">
                <h3 className="text-lg font-bold mb-4 text-white">Task Status Distribution</h3>
                <div className="h-64 flex justify-center">
                    <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                </div>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-lg border border-[#333]">
                <h3 className="text-lg font-bold mb-4 text-white">Workload by Priority</h3>
                <div className="h-64 flex justify-center">
                    <Bar data={workloadData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
