const Task = require('../models/Task');
const User = require('../models/User');

// @route GET /api/analytics/workload  (admin only)
// Returns active task count per user
const getWorkload = async (req, res, next) => {
  try {
    const result = await Task.aggregate([
      { $match: { status: { $ne: 'completed' } } },
      { $group: { _id: '$userId', taskCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $project: { _id: 0, name: '$user.name', taskCount: 1 } },
      { $sort: { taskCount: -1 } },
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/analytics/weekly-trend
// Returns completed tasks per week for last 4 weeks
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

      const count = await Task.countDocuments({
        status: 'completed',
        completedAt: { $gte: start, $lte: end },
      });

      weeks.push({ week: `Week ${4 - i}`, completed: count, start, end });
    }

    res.status(200).json({ success: true, data: weeks });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWorkload, getWeeklyTrend };
