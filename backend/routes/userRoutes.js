const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/users/team-members
// Admin only — returns all members in the same team (for task assignment dropdown)
router.get('/team-members', protect, adminOnly, async (req, res, next) => {
  try {
    const members = await User.find({ teamId: req.user.teamId }).select('name email role');
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
});

// GET /api/users  — kept for backward compat, same as above but no scope check
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const members = await User.find({ teamId: req.user.teamId }).select('name email role');
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
