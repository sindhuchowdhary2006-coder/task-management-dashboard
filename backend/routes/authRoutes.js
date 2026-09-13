const express = require('express');
const router = express.Router();
const { signup, login, getTeams } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);

// Public route — lets member signup page list all teams
router.get('/teams', getTeams);

module.exports = router;
