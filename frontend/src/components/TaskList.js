import React from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

const TaskList = ({ tasks, onEdit, onDelete, onStatusChange }) => {
  const { isAdmin } = useAuth();

  const handleMarkComplete = async (task) => {
    try {
      const { data } = await API.put(`/tasks/${task._id}`, { status: 'completed' });
      onStatusChange(data.data);
      toast.success('Task marked as completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      onDelete(taskId);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="card text-center text-gray-500 py-12">
        <p className="text-lg">No tasks found.</p>
        <p className="text-sm mt-1">Try adjusting your filters or add a new task.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const priority = task.priority || 'medium';
        return (
          <div
            key={task._id}
            className={`card flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              task.isOverdue ? 'border-l-4 border-red-400' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold text-gray-800 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </h3>
                {/* Status badge */}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[task.status]}`}>
                  {task.status}
                </span>
                {/* Priority badge */}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[priority]}`}>
                  {priority}
                </span>
                {/* Overdue badge */}
                {task.isOverdue && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                    Overdue
                  </span>
                )}
              </div>

              {task.description && (
                <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
              )}

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {task.dueDate && (
                  <p className={`text-xs ${task.isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
                {/* Show assigned user for admins */}
                {isAdmin && task.userId?.name && (
                  <p className="text-xs text-blue-500">👤 {task.userId.name}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {task.status !== 'completed' && (
                <button
                  onClick={() => handleMarkComplete(task)}
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                  aria-label="Mark complete"
                >
                  ✓ Complete
                </button>
              )}
              <button
                onClick={() => onEdit(task)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                aria-label="Edit task"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                className="btn-danger text-xs py-1.5"
                aria-label="Delete task"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
