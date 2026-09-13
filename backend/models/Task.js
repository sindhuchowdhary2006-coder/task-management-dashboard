const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // The team this task belongs to
    teamId: {
      type: String,
      required: [true, 'Team ID is required'],
    },
    // The member this task is assigned to
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'assignedTo user is required'],
    },
    // The admin who created the task
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-set completedAt when status changes to completed
taskSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update && update.status === 'completed') {
    update.completedAt = new Date();
  } else if (update && update.$set && update.$set.status === 'completed') {
    update.$set.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
