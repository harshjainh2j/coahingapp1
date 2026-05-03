const express = require('express');
const { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement } = require('./announcement.controller');
const { protect } = require('../auth/auth.middleware');

const router = express.Router();

router.use(protect); // Require auth for all announcement routes

router.post('/', createAnnouncement);
router.get('/', getAnnouncements);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;
