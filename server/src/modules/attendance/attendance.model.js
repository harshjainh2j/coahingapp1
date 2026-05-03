const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  date: {
    type: String, // Storing as YYYY-MM-DD for easy querying
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true
  }
}, { timestamps: true });

// Prevent duplicate attendance for the same student on the same day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
