const express = require('express');
const { login, logout, getMe } = require('./auth.controller');
const { protect } = require('./auth.middleware');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
