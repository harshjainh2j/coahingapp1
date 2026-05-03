const Announcement = require('./announcement.model');

// Teacher creates an announcement
const createAnnouncement = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create announcements' });
    }

    const user = await require('../users/user.model').findById(req.user.id);
    if (!user.batch) {
      return res.status(400).json({ message: 'You are not assigned to any batch' });
    }

    const announcement = await Announcement.create({
      content,
      teacher: req.user.id,
      batch: user.batch
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get announcements for a specific batch (Teacher/Student)
const getAnnouncements = async (req, res) => {
  try {
    const user = await require('../users/user.model').findById(req.user.id);
    if (!user.batch) {
      return res.json([]); // No batch assigned, return empty array
    }

    const announcements = await Announcement.find({ batch: user.batch })
      .populate('teacher', 'name userId')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can edit announcements' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (announcement.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this announcement' });
    }

    announcement.content = content;
    await announcement.save();

    res.json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can delete announcements' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (announcement.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await Announcement.findByIdAndDelete(id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement };
