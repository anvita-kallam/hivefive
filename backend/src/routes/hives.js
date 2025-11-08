import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Hive from '../models/Hive.js';
import User from '../models/User.js';

const router = express.Router();

// Get all hives for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hives = await Hive.find({ members: user._id })
      .populate('members', 'name profilePhoto email');
    res.json(hives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hive by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const hive = await Hive.findById(req.params.id)
      .populate('members', 'name profilePhoto email major hobbies resHall');
    if (!hive) {
      return res.status(404).json({ error: 'Hive not found' });
    }
    res.json(hive);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create hive
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, memberEmails, activityFrequency, settings } = req.body;
    
    // Get member IDs
    const memberIds = [user._id];
    if (memberEmails && memberEmails.length > 0) {
      const members = await User.find({ email: { $in: memberEmails } });
      memberIds.push(...members.map(m => m._id));
    }

    // Validate and clean defaultLocation if provided
    let cleanedSettings = settings || {};
    if (cleanedSettings.defaultLocation) {
      const coords = cleanedSettings.defaultLocation.coordinates;
      // If coordinates are null or invalid, remove defaultLocation
      if (!coords || !Array.isArray(coords) || coords.length !== 2 || 
          coords.some(c => typeof c !== 'number')) {
        delete cleanedSettings.defaultLocation;
      }
    }

    const hive = new Hive({
      name,
      members: memberIds,
      activityFrequency: activityFrequency || 'weekly',
      settings: cleanedSettings
    });

    await hive.save();

    // Update users' hiveIDs
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $addToSet: { hiveIDs: hive._id } }
    );

    res.status(201).json(hive);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update hive
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const hive = await Hive.findById(req.params.id);
    if (!hive) {
      return res.status(404).json({ error: 'Hive not found' });
    }

    // Verify user is a member
    const user = await User.findOne({ email: req.user.email });
    if (!hive.members.includes(user._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(hive, req.body);
    await hive.save();
    res.json(hive);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add member to hive
router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const hive = await Hive.findById(req.params.id);
    if (!hive) {
      return res.status(404).json({ error: 'Hive not found' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!hive.members.includes(user._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const newMember = await User.findOne({ email });
    if (!newMember) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (hive.members.includes(newMember._id)) {
      return res.status(400).json({ error: 'User already in hive' });
    }

    hive.members.push(newMember._id);
    await hive.save();

    newMember.hiveIDs.push(hive._id);
    await newMember.save();

    res.json(hive);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove member from hive (leave hive)
router.delete('/:id/members/me', authenticateToken, async (req, res) => {
  try {
    const hive = await Hive.findById(req.params.id);
    if (!hive) {
      return res.status(404).json({ error: 'Hive not found' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a member
    if (!hive.members.includes(user._id)) {
      return res.status(400).json({ error: 'You are not a member of this hive' });
    }

    // Remove user from hive members
    hive.members = hive.members.filter(memberId => memberId.toString() !== user._id.toString());
    await hive.save();

    // Remove hive from user's hiveIDs
    user.hiveIDs = user.hiveIDs.filter(hiveId => hiveId.toString() !== hive._id.toString());
    await user.save();

    res.json({ message: 'Successfully left hive', hive });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

