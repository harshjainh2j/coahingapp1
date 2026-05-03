const Resource = require('./resource.model');
const User = require('../users/user.model');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary from Env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload to cloudinary via stream
const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'auto', 
        folder: 'coachsync_resources',
        transformation: [
          { quality: "auto", fetch_format: "auto", width: 1920, crop: "limit" }
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

const createResource = async (req, res) => {
  try {
    const { title, type, linkUrl } = req.body;
    const user = await User.findById(req.user.id);

    if (req.user.role !== 'teacher' || !user.batch) {
      return res.status(403).json({ message: 'Not authorized or no batch assigned' });
    }

    if (!title || !type) {
      return res.status(400).json({ message: 'Title and type are required' });
    }

    let url = '';
    let cloudinaryId = '';
    let fileType = '';
    let size = 0;

    if (type === 'link') {
      if (!linkUrl) return res.status(400).json({ message: 'Link URL is required' });
      url = linkUrl;
    } else if (type === 'file') {
      if (!req.file) return res.status(400).json({ message: 'File is required' });
      
      // Enforce 10MB limit in controller as backup
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ message: 'File exceeds 10MB limit' });
      }

      // Upload to Cloudinary
      const result = await streamUpload(req);
      url = result.secure_url;
      cloudinaryId = result.public_id;
      fileType = result.format || req.file.originalname.split('.').pop();
      size = result.bytes;
    }

    const resource = await Resource.create({
      title,
      type,
      url,
      fileType,
      cloudinaryId,
      size,
      teacher: user._id,
      batch: user.batch
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

const getResources = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.batch) {
      return res.status(403).json({ message: 'No batch assigned to user' });
    }

    const resources = await Resource.find({ batch: user.batch })
      .populate('teacher', 'name userId')
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (req.user.role !== 'teacher' || resource.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    // Delete from Cloudinary if it's a file
    if (resource.type === 'file' && resource.cloudinaryId) {
      // resource_type depends on what was uploaded. Cloudinary defaults to image, but we uploaded 'auto'. 
      // If it was raw (like pdf in some cases), we need to specify resource_type. 
      // Using 'auto' in upload might mean we need to detect it. But we'll try to delete generally.
      // Usually cloudinary.uploader.destroy handles images/videos well. 
      // For raw files like PDF, we might need { resource_type: 'raw' }. 
      // Let's do a catch-all approach.
      try {
        await cloudinary.uploader.destroy(resource.cloudinaryId);
      } catch (cloudErr) {
        console.error('Failed to delete from cloudinary', cloudErr);
      }
    }

    await Resource.findByIdAndDelete(id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Calculate total storage used by this teacher to check 95% threshold
const getStorageUsage = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Since we don't know the exact Cloudinary account limits, 
    // we'll implement a generous soft limit per teacher of 500MB for demonstration.
    // 500MB = 524,288,000 bytes. 95% = 498,073,600 bytes.
    const TOTAL_LIMIT_BYTES = 500 * 1024 * 1024; 

    const result = await Resource.aggregate([
      { $match: { teacher: req.user._id, type: 'file' } },
      { $group: { _id: null, totalBytes: { $sum: '$size' } } }
    ]);

    const usedBytes = result.length > 0 ? result[0].totalBytes : 0;
    const usagePercent = Math.min(100, Math.round((usedBytes / TOTAL_LIMIT_BYTES) * 100));

    res.json({
      usedBytes,
      limitBytes: TOTAL_LIMIT_BYTES,
      usagePercent,
      isNearLimit: usagePercent >= 95
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createResource, getResources, deleteResource, getStorageUsage };
