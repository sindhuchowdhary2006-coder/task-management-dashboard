const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, teamId, teamName } = req.body;

    // ── Basic validation ──
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const assignedRole = role === 'admin' ? 'admin' : 'member';
    let resolvedTeamId = null;

    if (assignedRole === 'admin') {
      // ── Admin: auto-create a new Team ──
      const tName = teamName?.trim() || `${name}'s Team`;
      const team = await Team.create({ teamName: tName, adminId: 'PLACEHOLDER' });
      resolvedTeamId = team.teamId;

      const user = await User.create({
        name, email, password: hashedPassword,
        role: 'admin', teamId: resolvedTeamId,
      });

      // Link team's adminId to the real user now
      team.adminId = user._id;
      await team.save();

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, teamId: resolvedTeamId },
        team: { teamId: team.teamId, teamName: team.teamName },
      });
    }

    // ── Member: must provide teamId to join ──
    if (!teamId) {
      return res.status(400).json({ success: false, message: 'Members must provide a teamId to join a team' });
    }

    const team = await Team.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ success: false, message: `No team found with teamId "${teamId}". Ask your admin for the correct Team ID.` });
    }

    resolvedTeamId = team.teamId;

    const user = await User.create({
      name, email, password: hashedPassword,
      role: 'member', teamId: resolvedTeamId,
    });

    const token = generateToken(user._id);
    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, teamId: resolvedTeamId },
      team: { teamId: team.teamId, teamName: team.teamName },
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Fetch team info for the response
    const team = user.teamId ? await Team.findOne({ teamId: user.teamId }) : null;

    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
      },
      team: team ? { teamId: team.teamId, teamName: team.teamName } : null,
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/teams  — returns all teams (for member signup dropdown)
// ─────────────────────────────────────────────
const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().select('teamId teamName').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getTeams };
