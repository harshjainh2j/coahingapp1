const express = require('express');
const multer = require('multer');
const { createResource, getResources, deleteResource, getStorageUsage } = require('./resource.controller');
const { protect, restrictTo } = require('../auth/auth.middleware');

const router = express.Router();

// Memory storage for Multer (we stream to Cloudinary directly)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB hard limit in multer
});

router.use(protect);

router.get('/', getResources);

// Teacher only routes
router.get('/usage', restrictTo('teacher'), getStorageUsage);
router.post('/', restrictTo('teacher'), upload.single('file'), createResource);
router.delete('/:id', restrictTo('teacher'), deleteResource);

module.exports = router;
