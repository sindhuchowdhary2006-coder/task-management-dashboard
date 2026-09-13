const Task = require('../models/Task');
const User = require('../models/User');

// Helper: compute isOverdue on a plain object
const addOverdue = (task) => {
  const t = task.toObject ? task.toObject() : { ...task };
  const now = new Date();
  t.isOverdue = !!(t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed');
  return t;
};

// ─────────────────────────────────────────────
// GET /api/tasks  — scoped to team
// Admin → all tasks in their team
// Member → only tasks assigned to them in their team
// ─────────────────────────────────────────────
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const { teamId, role, _id: userId } = req.user;

    if (!teamId) {
      return res.status(400).json({ success: false, message: 'You are not part of any team yet' });
    }

    const filter = { teamId };

    // Members only see their own assigned tasks
    if (role === 'member') filter.assignedTo = userId;

    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (search)   filter.title    = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks.map(addOverdue) });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/tasks  — admin only, must assign to same-team member
// ─────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can create tasks' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }
    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'You must assign the task to a team member (assignedTo is required)' });
    }

    // Verify assignedTo user exists and belongs to the same team
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ success: false, message: 'Assigned user not found' });
    }
    if (assignee.teamId !== req.user.teamId) {
      return res.status(403).json({
        success: false,
        message: `Cannot assign task to a user from a different team. "${assignee.name}" belongs to team ${assignee.teamId}, but you are admin of team ${req.user.teamId}.`,
      });
    }

    const task = await Task.create({
      title,
      description,
      status:    status   || 'pending',
      priority:  priority || 'medium',
      dueDate,
      teamId:    req.user.teamId,
      assignedTo,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy',  select: 'name' },
    ]);

    res.status(201).json({ success: true, data: addOverdue(populated) });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PUT /api/tasks/:id
// Admin can update any task in their team
// Member can update only their own assigned tasks (status only)
// ─────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Must be in the same team
    if (task.teamId !== req.user.teamId) {
      return res.status(403).json({ success: false, message: 'Not authorized — task belongs to a different team' });
    }

    // Member can only update tasks assigned to them
    if (req.user.role === 'member' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    const updateData = { ...req.body };

    // If reassigning (admin only), verify the new assignee is in the same team
    if (updateData.assignedTo && req.user.role === 'admin') {
      const newAssignee = await User.findById(updateData.assignedTo);
      if (!newAssignee || newAssignee.teamId !== req.user.teamId) {
        return res.status(403).json({ success: false, message: 'Cannot reassign to a user from a different team' });
      }
    } else {
      // Members cannot change assignedTo
      delete updateData.assignedTo;
    }

    // Auto-set completedAt
    if (updateData.status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    res.status(200).json({ success: true, data: addOverdue(task) });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/tasks/:id  — admin only
// ─────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can delete tasks' });
    }
    if (task.teamId !== req.user.teamId) {
      return res.status(403).json({ success: false, message: 'Not authorized — task belongs to a different team' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/tasks/export
// ─────────────────────────────────────────────
const exportTasks = async (req, res, next) => {
  try {
    const { Parser } = require('json2csv');
    const filter = { teamId: req.user.teamId };
    if (req.user.role === 'member') filter.assignedTo = req.user._id;

    const tasks = await Task.find(filter).lean();
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'No tasks found to export' });
    }

    const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'teamId', 'createdAt'];
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
