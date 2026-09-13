const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getWorkload, getWeeklyTrend } = require('../controllers/analyticsController');

router.use(protect);

// Admin-only workload chart
router.get('/workload', adminOnly, getWorkload);

// All authenticated users can see weekly trend
router.get('/weekly-trend', getWeeklyTrend);

module.exports = router;
