const User = require('./user.model');

const createUser = async (req, res) => {
  try {
    const { userId, password, role, name, batch, phone } = req.body;

    if (!userId || !password || !role) {
      return res.status(400).json({ message: 'Please provide userId, password, and role' });
    }

    if (role === 'owner') {
      return res.status(400).json({ message: 'Cannot create additional owners' });
    }

    const userExists = await User.findOne({ userId });
    if (userExists) {
      return res.status(400).json({ message: 'User ID already exists' });
    }

    const user = await User.create({
      userId,
      password,
      role,
      name,
      batch,
      phone
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, userId: user.userId, role: user.role, name: user.name, batch: user.batch }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'owner' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, userId, batch, phone, password } = req.body;

    const user = await User.findById(id);
    if (!user || user.role === 'owner') {
      return res.status(404).json({ message: 'User not found or cannot be modified' });
    }

    if (userId && userId !== user.userId) {
      const exists = await User.findOne({ userId });
      if (exists) return res.status(400).json({ message: 'User ID already exists' });
      user.userId = userId;
    }

    if (name !== undefined) user.name = name;
    if (batch !== undefined) user.batch = batch;
    if (phone !== undefined) user.phone = phone;
    if (password) user.password = password; // pre-save hook will hash it automatically

    await user.save();
    
    res.json({ message: 'User updated successfully', user: { id: user._id, userId: user.userId, role: user.role, name: user.name, batch: user.batch, phone: user.phone } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user || user.role === 'owner') {
      return res.status(404).json({ message: 'User not found or cannot be deleted' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudentsByBatch = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.user.role !== 'teacher' || !user.batch) {
      return res.status(403).json({ message: 'Not authorized or no batch assigned' });
    }

    const students = await User.find({ role: 'student', batch: user.batch }).select('name userId phone remarks createdAt');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStudentRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.remarks = remarks;
    await student.save();

    res.json({ message: 'Remarks updated successfully', remarks: student.remarks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser, getStudentsByBatch, updateStudentRemarks };
