const Task = require('../models/Task');

// GET /api/analytics/workload  (admin only) — active tasks per member in the same team
const getWorkload = async (req, res, next) => {
  try {
    const result = await Task.aggregate([
      { $match: { teamId: req.user.teamId, status: { $ne: 'completed' } } },
      { $group: { _id: '$assignedTo', taskCount: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, name: '$user.name', taskCount: 1 } },
      { $sort: { taskCount: -1 } },
    ]);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/weekly-trend — completions per week for last 4 weeks (team scoped)
const getWeeklyTrend = async (req, res, next) => {
  try {
    const now = new Date();
    const weeks = [];

    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i + 1) * 7);
      start.setHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);

      const filter = { teamId: req.user.teamId, status: 'completed', completedAt: { $gte: start, $lte: end } };
      if (req.user.role === 'member') filter.assignedTo = req.user._id;

      const count = await Task.countDocuments(filter);
      weeks.push({ week: `Week ${4 - i}`, completed: count });
    }

    res.status(200).json({ success: true, data: weeks });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWorkload, getWeeklyTrend };
