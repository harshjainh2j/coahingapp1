const Attendance = require('./attendance.model');
const User = require('../users/user.model');

// Teacher: Get attendance for their batch on a specific date
const getAttendance = async (req, res) => {
  try {
    const { date } = req.params;
    const user = await User.findById(req.user.id);
    
    if (req.user.role !== 'teacher' || !user.batch) {
      return res.status(403).json({ message: 'Not authorized or no batch assigned' });
    }

    const attendanceRecords = await Attendance.find({ 
      batch: user.batch, 
      date: date 
    }).populate('student', 'name userId');

    res.json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Teacher: Save/Update attendance for multiple students
const saveAttendance = async (req, res) => {
  try {
    const { date, records } = req.body; // records is array of { studentId, status }
    const user = await User.findById(req.user.id);

    if (req.user.role !== 'teacher' || !user.batch) {
      return res.status(403).json({ message: 'Not authorized or no batch assigned' });
    }

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    // Process each record (upsert)
    const operations = records.map(record => ({
      updateOne: {
        filter: { student: record.studentId, date: date, batch: user.batch },
        update: { $set: { status: record.status } },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }

    res.json({ message: 'Attendance saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student: Get their own attendance
const getStudentAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const attendanceRecords = await Attendance.find({ 
      student: req.user.id 
    }).sort({ date: -1 });

    res.json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAttendance, saveAttendance, getStudentAttendance };
