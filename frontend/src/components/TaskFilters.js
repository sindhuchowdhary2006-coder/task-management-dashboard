import React from 'react';

const TaskFilters = ({ filters, onChange }) => {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="card mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <input
          type="text"
          name="search"
          className="input-field flex-1"
          placeholder="🔍 Search tasks by title..."
          value={filters.search}
          onChange={handleChange}
        />
        {/* Status filter */}
        <select name="status" className="input-field sm:w-44" value={filters.status} onChange={handleChange}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {/* Priority filter */}
        <select name="priority" className="input-field sm:w-44" value={filters.priority} onChange={handleChange}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;
