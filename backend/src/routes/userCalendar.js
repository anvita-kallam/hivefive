import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import UserCalendarEvent from '../models/UserCalendarEvent.js';
import User from '../models/User.js';

const router = express.Router();

// Get all calendar events for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { startDate, endDate } = req.query;
    
    let query = { userID: user._id };
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const events = await UserCalendarEvent.find(query)
      .sort({ startTime: 1 })
      .lean();

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific calendar event
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const event = await UserCalendarEvent.findOne({
      _id: req.params.id,
      userID: user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new calendar event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { title, description, startTime, endTime, location, color, allDay } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, startTime, and endTime are required' });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const event = new UserCalendarEvent({
      userID: user._id,
      title,
      description: description || '',
      startTime: start,
      endTime: end,
      location: location || '',
      color: color || '#3B82F6',
      allDay: allDay || false
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update a calendar event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const event = await UserCalendarEvent.findOne({
      _id: req.params.id,
      userID: user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { title, description, startTime, endTime, location, color, allDay } = req.body;

    // Update fields
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (startTime !== undefined) {
      const start = new Date(startTime);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ error: 'Invalid startTime format' });
      }
      event.startTime = start;
    }
    if (endTime !== undefined) {
      const end = new Date(endTime);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid endTime format' });
      }
      event.endTime = end;
    }
    if (location !== undefined) event.location = location;
    if (color !== undefined) event.color = color;
    if (allDay !== undefined) event.allDay = allDay;

    // Validate dates
    if (event.startTime >= event.endTime) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a calendar event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const event = await UserCalendarEvent.findOneAndDelete({
      _id: req.params.id,
      userID: user._id
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

