const express = require('express');
const { getAttendance, saveAttendance, getStudentAttendance } = require('./attendance.controller');
const { protect, restrictTo } = require('../auth/auth.middleware');

const router = express.Router();

router.use(protect);

// Teacher routes
router.get('/date/:date', restrictTo('teacher'), getAttendance);
router.post('/', restrictTo('teacher'), saveAttendance);

// Student routes
router.get('/my-records', restrictTo('student'), getStudentAttendance);

module.exports = router;
