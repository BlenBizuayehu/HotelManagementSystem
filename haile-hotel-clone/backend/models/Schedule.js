import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  shiftType: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'full-day'],
    required: true,
  },
  startTime: {
    type: String, // e.g., '09:00'
    required: true,
  },
  endTime: {
    type: String, // e.g., '17:00'
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  notes: String,
  breakDuration: {
    type: Number, // in minutes
    default: 60,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
scheduleSchema.index({ employee: 1, date: 1 });
scheduleSchema.index({ date: 1, department: 1 });

export default mongoose.model('Schedule', scheduleSchema);
