const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['file', 'link'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  fileType: {
    type: String // e.g., 'pdf', 'jpg', 'png', etc. (Only applicable if type is 'file')
  },
  cloudinaryId: {
    type: String // To easily delete it later from Cloudinary
  },
  size: {
    type: Number // In bytes, to track storage usage
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batch: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
