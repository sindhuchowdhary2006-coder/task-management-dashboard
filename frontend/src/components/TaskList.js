import React from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending:      'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30',
  'in-progress':'bg-blue-500/20 text-blue-200 border border-blue-400/30',
  completed:    'bg-green-500/20 text-green-200 border border-green-400/30',
};

const PRIORITY_STYLES = {
  high:   'bg-red-500/20 text-red-300 border border-red-400/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30',
  low:    'bg-gray-500/20 text-gray-300 border border-gray-400/30',
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
    if (!window.confirm('Delete this task?')) return;
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
      <div className="card text-center text-white/50 py-12">
        <p className="text-lg">No tasks found.</p>
        <p className="text-sm mt-1">
          {isAdmin ? 'Create a task and assign it to a team member.' : 'No tasks assigned to you yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Admin column header */}
      {isAdmin && (
        <div className="hidden sm:grid grid-cols-12 text-xs font-semibold text-white/40 uppercase tracking-wide px-4 pb-1 border-b border-white/10">
          <span className="col-span-4">Task</span>
          <span className="col-span-2">Assigned To</span>
          <span className="col-span-2">Status / Priority</span>
          <span className="col-span-2">Due Date</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>
      )}

      {tasks.map((task) => {
        const priority = task.priority || 'medium';
        const assignee = task.assignedTo;

        return (
          <div
            key={task._id}
            className={`card flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              task.isOverdue ? 'border-l-4 border-red-400' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold text-white ${task.status === 'completed' ? 'line-through text-white/40' : ''}`}>
                  {task.title}
                </h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[task.status]}`}>
                  {task.status}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[priority]}`}>
                  {priority}
                </span>
                {task.isOverdue && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                    Overdue
                  </span>
                )}
              </div>

              {task.description && (
                <p className="text-sm text-white/50 mt-1 truncate">{task.description}</p>
              )}

              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                {/* Assigned to — always visible so member can confirm it's theirs */}
                {assignee && (
                  <span className="text-xs text-indigo-300 font-medium">
                    👤 {assignee.name || assignee.email}
                    {isAdmin && task.createdBy && (
                      <span className="text-white/30 ml-1">(by {task.createdBy.name})</span>
                    )}
                  </span>
                )}
                {task.dueDate && (
                  <span className={`text-xs ${task.isOverdue ? 'text-red-400 font-medium' : 'text-white/40'}`}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {task.status !== 'completed' && (
                <button onClick={() => handleMarkComplete(task)}
                  className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/30 font-medium px-3 py-1.5 rounded-lg transition-colors">
                  ✓ Complete
                </button>
              )}
              {isAdmin && (
                <>
                  <button onClick={() => onEdit(task)}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white/70 font-medium px-3 py-1.5 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task._id)}
                    className="btn-danger text-xs py-1.5">
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
