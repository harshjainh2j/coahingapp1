const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  text: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  cloudinaryId: {
    type: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: '30d' // Automatically delete documents 30 days after creation
  }
});

module.exports = mongoose.model('Doubt', doubtSchema);
