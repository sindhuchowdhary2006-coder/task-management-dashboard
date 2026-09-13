import React from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending:      'bg-yellow-100 text-yellow-800',
  'in-progress':'bg-blue-100 text-blue-800',
  completed:    'bg-green-100 text-green-800',
};

const PRIORITY_STYLES = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-gray-100 text-gray-500',
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
      <div className="card text-center text-gray-500 py-12">
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
        <div className="hidden sm:grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pb-1 border-b border-gray-100">
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
                <h3 className={`font-semibold text-gray-800 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
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
                <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
              )}

              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                {/* Assigned to — always visible so member can confirm it's theirs */}
                {assignee && (
                  <span className="text-xs text-indigo-600 font-medium">
                    👤 {assignee.name || assignee.email}
                    {isAdmin && task.createdBy && (
                      <span className="text-gray-400 ml-1">(by {task.createdBy.name})</span>
                    )}
                  </span>
                )}
                {task.dueDate && (
                  <span className={`text-xs ${task.isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {task.status !== 'completed' && (
                <button onClick={() => handleMarkComplete(task)}
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors">
                  ✓ Complete
                </button>
              )}
              {/* Only admin can edit/delete */}
              {isAdmin && (
                <>
                  <button onClick={() => onEdit(task)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg transition-colors">
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
