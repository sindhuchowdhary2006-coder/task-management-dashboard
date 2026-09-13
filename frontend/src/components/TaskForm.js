import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import Spinner from './Spinner';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { title: '', description: '', status: 'pending', priority: 'medium', dueDate: '', assignedUserId: '' };

const TaskForm = ({ onTaskSaved, editingTask, onCancelEdit, users = [] }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || '',
        description: editingTask.description || '',
        status: editingTask.status || 'pending',
        priority: editingTask.priority || 'medium',
        dueDate: editingTask.dueDate ? editingTask.dueDate.split('T')[0] : '',
        assignedUserId: editingTask.userId?._id || editingTask.userId || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingTask]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Task title is required'); return; }

    setLoading(true);
    try {
      const payload = { ...form };
      if (isAdmin && form.assignedUserId) payload.userId = form.assignedUserId;
      delete payload.assignedUserId;

      if (editingTask) {
        const { data } = await API.put(`/tasks/${editingTask._id}`, payload);
        toast.success('Task updated!');
        onTaskSaved(data.data, 'update');
        onCancelEdit();
      } else {
        const { data } = await API.post('/tasks', payload);
        toast.success('Task created!');
        onTaskSaved(data.data, 'create');
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="input-field" type="text" name="title" placeholder="Task title *"
          value={form.title} onChange={handleChange} required />
        <textarea className="input-field resize-none" name="description" placeholder="Description (optional)"
          rows={2} value={form.description} onChange={handleChange} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select className="input-field" name="status" value={form.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input-field" name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input className="input-field" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
        </div>

        {/* Admin-only: assign to user */}
        {isAdmin && users.length > 0 && (
          <select className="input-field" name="assignedUserId" value={form.assignedUserId} onChange={handleChange}>
            <option value="">Assign to user (optional)</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        )}

        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading && <Spinner size="sm" />}
            {editingTask ? 'Update Task' : 'Add Task'}
          </button>
          {editingTask && (
            <button type="button" className="btn-secondary" onClick={onCancelEdit}>Cancel</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
