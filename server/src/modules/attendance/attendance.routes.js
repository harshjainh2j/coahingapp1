const express = require('express');
const { getAttendance, saveAttendance, getStudentAttendance, getStudentAttendanceHistory } = require('./attendance.controller');
const { protect, restrictTo } = require('../auth/auth.middleware');

const router = express.Router();

router.use(protect);

// Teacher routes
router.get('/date/:date', restrictTo('teacher'), getAttendance);
router.post('/', restrictTo('teacher'), saveAttendance);
router.get('/student/:studentId', restrictTo('teacher'), getStudentAttendanceHistory);

// Student routes
router.get('/my-records', restrictTo('student'), getStudentAttendance);

module.exports = router;
