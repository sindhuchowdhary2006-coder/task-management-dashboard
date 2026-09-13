import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskFilters from '../components/TaskFilters';
import StatusBarChart from '../components/StatusBarChart';
import CompletionLineChart from '../components/CompletionLineChart';
import WorkloadChart from '../components/WorkloadChart';
import WeeklyTrendChart from '../components/WeeklyTrendChart';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const EMPTY_FILTERS = { search: '', status: '', priority: '' };

const Dashboard = () => {
  const { isAdmin } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [users, setUsers] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);

  // Notification badge: overdue + due today
  const alertCount = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    if (t.isOverdue) return true;
    if (t.dueDate) {
      const due = new Date(t.dueDate);
      const today = new Date();
      return (
        due.getFullYear() === today.getFullYear() &&
        due.getMonth() === today.getMonth() &&
        due.getDate() === today.getDate()
      );
    }
    return false;
  }).length;

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const { data } = await API.get('/tasks', { params });
      setTasks(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const [trendRes, workloadRes] = await Promise.allSettled([
        API.get('/analytics/weekly-trend'),
        isAdmin ? API.get('/analytics/workload') : Promise.resolve({ data: { data: [] } }),
      ]);
      if (trendRes.status === 'fulfilled') setWeeklyTrend(trendRes.value.data.data);
      if (workloadRes.status === 'fulfilled') setWorkload(workloadRes.value.data.data);
    } catch (_) {}
  }, [isAdmin]);

  // Fetch all users for admin assign dropdown
  useEffect(() => {
    if (isAdmin) {
      API.get('/users').then(({ data }) => setUsers(data.data || [])).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const handleTaskSaved = (savedTask, type) => {
    if (type === 'create') setTasks((prev) => [savedTask, ...prev]);
    else setTasks((prev) => prev.map((t) => (t._id === savedTask._id ? savedTask : t)));
    fetchAnalytics();
  };

  const handleDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    fetchAnalytics();
  };

  const handleStatusChange = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    fetchAnalytics();
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

  // Tab filtering is client-side on top of server filters
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'all') return true;
    return t.status === activeTab;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => t.isOverdue).length,
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

        {/* Page title + notification badge */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
          {alertCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-bounce">
              {alertCount} alert{alertCount > 1 ? 's' : ''}
            </span>
          )}
          {isAdmin && (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
              Admin
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {tabs.map(({ key, label }) => (
            <div key={key} className="card text-center">
              <p className="text-2xl font-bold text-blue-600">{counts[key]}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
          <div className="card text-center border-red-200">
            <p className="text-2xl font-bold text-red-500">{counts.overdue}</p>
            <p className="text-sm text-gray-500">Overdue</p>
          </div>
        </div>

        {/* Task form */}
        <div className="mb-6">
          <TaskForm
            onTaskSaved={handleTaskSaved}
            editingTask={editingTask}
            onCancelEdit={() => setEditingTask(null)}
            users={users}
          />
        </div>

        {/* Filters */}
        <TaskFilters filters={filters} onChange={setFilters} />

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
          <div className="mt-8 space-y-6">
            <h2 className="text-lg font-bold text-gray-700">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusBarChart tasks={tasks} />
              <CompletionLineChart tasks={tasks} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeeklyTrendChart data={weeklyTrend} />
              {isAdmin && <WorkloadChart data={workload} />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
