const express = require('express');
const multer = require('multer');
const { getDoubts, createDoubt, deleteDoubt } = require('./doubt.controller');
const { protect } = require('../auth/auth.middleware');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed for chat attachments'), false);
    }
  }
});

router.use(protect); // Both teachers and students can access

router.get('/', getDoubts);
router.post('/', upload.single('image'), createDoubt);
router.delete('/:id', deleteDoubt);

module.exports = router;
