const express = require('express');
const { createUser, getUsers, updateUser, deleteUser, getStudentsByBatch, updateStudentRemarks } = require('./user.controller');
const { protect, restrictTo } = require('../auth/auth.middleware');

const router = express.Router();

router.use(protect);

// Teacher route
router.get('/students', restrictTo('teacher'), getStudentsByBatch);
router.put('/:id/remarks', restrictTo('teacher'), updateStudentRemarks);

// Owner routes
router.post('/', restrictTo('owner'), createUser);
router.get('/', restrictTo('owner'), getUsers);
router.put('/:id', restrictTo('owner'), updateUser);
router.delete('/:id', restrictTo('owner'), deleteUser);

module.exports = router;
