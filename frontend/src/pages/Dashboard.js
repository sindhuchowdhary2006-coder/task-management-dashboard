import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import StatusBarChart from '../components/StatusBarChart';
import CompletionLineChart from '../components/CompletionLineChart';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/tasks');
      setTasks(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSaved = (savedTask, type) => {
    if (type === 'create') {
      setTasks((prev) => [savedTask, ...prev]);
    } else {
      setTasks((prev) => prev.map((t) => (t._id === savedTask._id ? savedTask : t)));
    }
  };

  const handleDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const handleStatusChange = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
  };

  const handleExport = async () => {
    try {
      const response = await API.get('/tasks/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tasks.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Tasks exported!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'all') return true;
    return t.status === activeTab;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {tabs.map(({ key, label }) => (
            <div key={key} className="card text-center">
              <p className="text-2xl font-bold text-blue-600">{counts[key]}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Task form */}
        <div className="mb-6">
          <TaskForm
            onTaskSaved={handleTaskSaved}
            editingTask={editingTask}
            onCancelEdit={() => setEditingTask(null)}
          />
        </div>

        {/* Tabs + Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2 flex-wrap">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label} ({counts[key]})
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="btn-secondary text-sm">
            ↓ Export CSV
          </button>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="py-12"><Spinner size="lg" /></div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Analytics charts */}
        {tasks.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusBarChart tasks={tasks} />
            <CompletionLineChart tasks={tasks} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
