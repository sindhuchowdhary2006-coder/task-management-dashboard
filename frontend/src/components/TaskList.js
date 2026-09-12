import React from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const TaskList = ({ tasks, onEdit, onDelete, onStatusChange }) => {
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
        <p className="text-lg">No tasks yet.</p>
        <p className="text-sm mt-1">Add your first task using the form above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-gray-800 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[task.status]}`}>
                {task.status}
              </span>
            </div>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
            )}
            {task.dueDate && (
              <p className="text-xs text-gray-400 mt-1">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
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
      ))}
    </div>
  );
};

export default TaskList;
