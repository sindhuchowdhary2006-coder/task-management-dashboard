const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getTasks, createTask, updateTask, deleteTask, exportTasks } = require('../controllers/taskController');

router.use(protect);

// export must come before /:id
router.get('/export', exportTasks);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
