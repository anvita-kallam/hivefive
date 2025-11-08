import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

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
    const { name, major, hobbies, resHall, hometown, birthday, profilePhoto, preferences } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.user.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email: req.user.email,
      major,
      hobbies: hobbies || [],
      resHall,
      hometown,
      birthday: birthday ? new Date(birthday) : null,
      profilePhoto,
      preferences: preferences || {}
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

    Object.assign(user, req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

