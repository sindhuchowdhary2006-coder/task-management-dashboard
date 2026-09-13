const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const teamSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      unique: true,
      default: () => 'T-' + uuidv4().slice(0, 8).toUpperCase(),
    },
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
