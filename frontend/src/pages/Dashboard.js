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
  const { isAdmin, user, team } = useAuth();

  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab,   setActiveTab]   = useState('all');
  const [filters,     setFilters]     = useState(EMPTY_FILTERS);
  const [teamMembers, setTeamMembers] = useState([]);
  const [workload,    setWorkload]    = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);

  // Alert badge: overdue + due today
  const alertCount = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    if (t.isOverdue) return true;
    if (t.dueDate) {
      const d = new Date(t.dueDate), now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    }
    return false;
  }).length;

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search)   params.search   = filters.search;
      if (filters.status)   params.status   = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const { data } = await API.get('/tasks', { params });
      setTasks(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [trendRes, workRes] = await Promise.allSettled([
        API.get('/analytics/weekly-trend'),
        isAdmin ? API.get('/analytics/workload') : Promise.resolve({ data: { data: [] } }),
      ]);
      if (trendRes.status === 'fulfilled') setWeeklyTrend(trendRes.value.data.data);
      if (workRes.status  === 'fulfilled') setWorkload(workRes.value.data.data);
    } catch (_) {}
  }, [isAdmin]);

  // Fetch team members for task assignment dropdown (admin only)
  useEffect(() => {
    if (isAdmin) {
      API.get('/users/team-members')
        .then(({ data }) => setTeamMembers(data.data || []))
        .catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => { fetchTasks();    }, [fetchTasks]);
  useEffect(() => { fetchAnalytics();}, [fetchAnalytics]);

  const handleTaskSaved = (savedTask, type) => {
    if (type === 'create') setTasks((p) => [savedTask, ...p]);
    else setTasks((p) => p.map((t) => (t._id === savedTask._id ? savedTask : t)));
    fetchAnalytics();
  };
  const handleDelete        = (id)   => { setTasks((p) => p.filter((t) => t._id !== id)); fetchAnalytics(); };
  const handleStatusChange  = (task) => { setTasks((p) => p.map((t) => (t._id === task._id ? task : t))); fetchAnalytics(); };

  const handleExport = async () => {
    try {
      const response = await API.get('/tasks/export', { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'tasks.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Tasks exported!');
    } catch { toast.error('Export failed'); }
  };

  const filteredTasks = tasks.filter((t) => activeTab === 'all' || t.status === activeTab);

  const counts = {
    all:          tasks.length,
    pending:      tasks.filter((t) => t.status === 'pending').length,
    'in-progress':tasks.filter((t) => t.status === 'in-progress').length,
    completed:    tasks.filter((t) => t.status === 'completed').length,
    overdue:      tasks.filter((t) => t.isOverdue).length,
  };

  const tabs = [
    { key: 'all',          label: 'All' },
    { key: 'pending',      label: 'Pending' },
    { key: 'in-progress',  label: 'In Progress' },
    { key: 'completed',    label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* Title + alerts */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? '👑 Admin Dashboard' : '👤 My Tasks'}
          </h1>
          {team && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {team.teamName}
            </span>
          )}
          {alertCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-bounce">
              ⚠ {alertCount} alert{alertCount > 1 ? 's' : ''}
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
          <div className="card text-center">
            <p className="text-2xl font-bold text-red-500">{counts.overdue}</p>
            <p className="text-sm text-gray-500">Overdue</p>
          </div>
        </div>

        {/* Task creation form — admin only (TaskForm returns null for members) */}
        <div className="mb-6">
          <TaskForm
            onTaskSaved={handleTaskSaved}
            editingTask={editingTask}
            onCancelEdit={() => setEditingTask(null)}
            teamMembers={teamMembers}
          />
        </div>

        {/* Member info panel */}
        {!isAdmin && (
          <div className="card mb-6 bg-blue-50 border border-blue-100">
            <p className="text-sm text-blue-700">
              Showing tasks assigned to <strong>{user?.name}</strong> in team <strong>{team?.teamName}</strong>.
              Contact your admin to create or reassign tasks.
            </p>
          </div>
        )}

        {/* Filters */}
        <TaskFilters filters={filters} onChange={setFilters} />

        {/* Tabs + Export */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2 flex-wrap">
            {tabs.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}>
                {label} ({counts[key]})
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="btn-secondary text-sm">↓ Export CSV</button>
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

        {/* Analytics */}
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
