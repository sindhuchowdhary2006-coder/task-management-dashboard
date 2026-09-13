import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const WeeklyTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card text-center text-gray-400 py-8">
        <p>No trend data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.week),
    datasets: [
      {
        label: 'Completed Tasks',
        data: data.map((d) => d.completed),
        borderColor: 'rgba(34,197,94,1)',
        backgroundColor: 'rgba(34,197,94,0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(34,197,94,1)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Tasks Completed — Last 4 Weeks', font: { size: 14 } },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  return (
    <div className="card">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default WeeklyTrendChart;
