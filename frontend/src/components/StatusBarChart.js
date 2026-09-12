import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const STATUS_COLORS = {
  pending: 'rgba(251, 191, 36, 0.8)',
  'in-progress': 'rgba(59, 130, 246, 0.8)',
  completed: 'rgba(34, 197, 94, 0.8)',
};

const StatusBarChart = ({ tasks }) => {
  const counts = { pending: 0, 'in-progress': 0, completed: 0 };
  tasks.forEach((t) => {
    if (counts[t.status] !== undefined) counts[t.status]++;
  });

  const data = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Tasks by Status',
        data: [counts.pending, counts['in-progress'], counts.completed],
        backgroundColor: [
          STATUS_COLORS.pending,
          STATUS_COLORS['in-progress'],
          STATUS_COLORS.completed,
        ],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Tasks by Status', font: { size: 15 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="card">
      <Bar data={data} options={options} />
    </div>
  );
};

export default StatusBarChart;
