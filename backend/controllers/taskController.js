const Task = require('../models/Task');

// Helper: add isOverdue field
const addOverdue = (task) => {
  const t = task.toObject ? task.toObject() : { ...task };
  const now = new Date();
  t.isOverdue = !!(t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed');
  return t;
};

// @route GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;

    // Admins see all tasks; members see only their own
    const baseFilter = req.user.role === 'admin' ? {} : { userId: req.user._id };

    if (status) baseFilter.status = status;
    if (priority) baseFilter.priority = priority;
    if (search) baseFilter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(baseFilter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const data = tasks.map(addOverdue);

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, userId: assignedUserId } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    // Admins can assign to any user; members always get assigned to themselves
    const taskUserId = req.user.role === 'admin' && assignedUserId
      ? assignedUserId
      : req.user._id;

    const task = await Task.create({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
      userId: taskUserId,
    });

    res.status(201).json({ success: true, data: addOverdue(task) });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update their own tasks
    if (req.user.role !== 'admin' && task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    // If marking complete, set completedAt
    const updateData = { ...req.body };
    if (updateData.status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: addOverdue(task) });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only delete their own tasks
    if (req.user.role !== 'admin' && task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/tasks/export
const exportTasks = async (req, res, next) => {
  try {
    const { Parser } = require('json2csv');
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const tasks = await Task.find(filter).lean();

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'No tasks found to export' });
    }

    const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(tasks);

    res.header('Content-Type', 'text/csv');
    res.attachment('tasks.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, exportTasks };
