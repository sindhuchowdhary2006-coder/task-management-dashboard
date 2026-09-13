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

const WorkloadChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card text-center text-gray-400 py-8">
        <p>No workload data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Active Tasks',
        data: data.map((d) => d.taskCount),
        backgroundColor: data.map((_, i) =>
          i === 0 ? 'rgba(239,68,68,0.8)' :
          i === 1 ? 'rgba(249,115,22,0.8)' :
          'rgba(59,130,246,0.8)'
        ),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Team Workload (Active Tasks per Member)', font: { size: 14 } },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  return (
    <div className="card">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default WorkloadChart;
