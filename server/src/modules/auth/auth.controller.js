const User = require('../users/user.model');
const jwt = require('jsonwebtoken');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'owner' });
    if (!adminExists) {
      await User.create({
        userId: 'admin',
        password: '@iamadmin',
        role: 'owner',
        name: 'System Admin'
      });
      console.log('Default admin seeded.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

const login = async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
      message: 'Login successful',
      user: { id: user._id, userId: user.userId, role: user.role, name: user.name, batch: user.batch }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { seedAdmin, login, logout, getMe };
