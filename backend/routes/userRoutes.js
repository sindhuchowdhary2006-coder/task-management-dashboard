const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/users — admin only, returns all users for task assignment
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().select('name email role');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
