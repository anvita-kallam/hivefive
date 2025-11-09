import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get current user profile (must be before /:id route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email })
      .select('-googleCalendarRefreshToken');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('hiveIDs', 'name members')
      .select('-googleCalendarRefreshToken');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, school, major, hobbies, resHall, hometown, birthday, profilePhoto, preferences } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.user.email });
    if (existingUser) {
      // Return 200 with existing user instead of 400, as this is not really an error
      return res.status(200).json({ 
        user: existingUser,
        message: 'User already exists'
      });
    }

    const user = new User({
      name: name.trim(),
      email: req.user.email,
      school: school || '',
      major: major || '',
      hobbies: hobbies || [],
      resHall: resHall || '',
      hometown: hometown || '',
      birthday: birthday ? new Date(birthday) : null,
      profilePhoto: profilePhoto || null,
      preferences: preferences || {}
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to create user',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify ownership
    if (user.email !== req.user.email) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update allowed fields
    const { name, school, major, hobbies, resHall, hometown, birthday, profilePhoto } = req.body;
    
    if (name !== undefined) user.name = name;
    if (school !== undefined) user.school = school;
    if (major !== undefined) user.major = major;
    if (hobbies !== undefined) user.hobbies = hobbies;
    if (resHall !== undefined) user.resHall = resHall;
    if (hometown !== undefined) user.hometown = hometown;
    if (birthday !== undefined) user.birthday = birthday ? new Date(birthday) : null;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

