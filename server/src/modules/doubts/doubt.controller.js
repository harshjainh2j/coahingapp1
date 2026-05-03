const Doubt = require('./doubt.model');
const User = require('../users/user.model');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Helper function to upload to cloudinary via stream
const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'auto', 
        folder: 'coachsync_doubts',
        transformation: [
          { quality: "auto", fetch_format: "auto", width: 1920, crop: "limit" } // Compress chat images automatically
        ]
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

const getDoubts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.batch) {
      return res.status(403).json({ message: 'No batch assigned to user' });
    }

    // TTL index handles 30 day expiration automatically
    const doubts = await Doubt.find({ batch: user.batch })
      .populate('sender', 'name role userId')
      .sort({ createdAt: 1 })
      .limit(200); // Optional limit to prevent massive loads

    res.json(doubts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createDoubt = async (req, res) => {
  try {
    const { text } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.batch) {
      return res.status(403).json({ message: 'No batch assigned' });
    }

    if (!text && !req.file) {
      return res.status(400).json({ message: 'Message must contain text or an image' });
    }

    let imageUrl = '';
    let cloudinaryId = '';

    if (req.file) {
      // 10MB limit in controller as backup
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ message: 'Image exceeds 10MB limit' });
      }

      // Upload to Cloudinary with compression
      const result = await streamUpload(req);
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
    }

    let doubt = await Doubt.create({
      sender: user._id,
      batch: user.batch,
      text,
      imageUrl,
      cloudinaryId
    });

    doubt = await doubt.populate('sender', 'name role userId');

    res.status(201).json(doubt);
  } catch (error) {
    console.error('Error creating doubt:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

const deleteDoubt = async (req, res) => {
  try {
    const { id } = req.params;
    const doubt = await Doubt.findById(id);

    if (!doubt) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Allow deleting ONLY if the user is the sender
    if (doubt.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    // Delete from Cloudinary if it has an image
    if (doubt.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(doubt.cloudinaryId);
      } catch (cloudErr) {
        console.error('Failed to delete image from cloudinary', cloudErr);
      }
    }

    await Doubt.findByIdAndDelete(id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDoubts, createDoubt, deleteDoubt };
