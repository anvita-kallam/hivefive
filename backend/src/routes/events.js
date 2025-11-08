import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Event from '../models/Event.js';
import Hive from '../models/Hive.js';
import User from '../models/User.js';
import InteractionLog from '../models/InteractionLog.js';
import { generateEventProposals } from '../services/hiveAgent.js';

const router = express.Router();

// Get events for a hive
router.get('/hive/:hiveId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const hive = await Hive.findById(req.params.hiveId);
    
    if (!hive || !hive.members.includes(user._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const events = await Event.find({ hiveID: req.params.hiveId })
      .populate('createdBy', 'name profilePhoto')
      .populate('acceptedBy', 'name profilePhoto')
      .populate('declinedBy', 'name profilePhoto')
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name profilePhoto')
      .populate('acceptedBy', 'name profilePhoto')
      .populate('declinedBy', 'name profilePhoto');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event (triggers Hive Agent)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const { hiveID, title, description, location } = req.body;

    const hive = await Hive.findById(hiveID).populate('members');
    if (!hive || !hive.members.some(m => m._id.toString() === user._id.toString())) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate event proposals using Hive Agent
    const proposedTimes = await generateEventProposals(hive, user);

    // Validate and clean location data
    let cleanedLocation = null;
    if (location) {
      const coords = location.coordinates;
      if (coords && Array.isArray(coords) && coords.length === 2 && 
          coords.every(c => typeof c === 'number')) {
        // Ensure location has required GeoJSON structure
        cleanedLocation = {
          type: 'Point',
          coordinates: [coords[0], coords[1]], // [longitude, latitude]
          address: location.address || '',
          name: location.name || ''
        };
      }
    }

    const event = new Event({
      hiveID,
      title,
      description,
      proposedTimes,
      location: cleanedLocation,
      createdBy: user._id,
      status: 'proposed'
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Swipe on event
router.post('/:id/swipe', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const { swipeDirection, responseTime, emotionData, gpsData } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const hive = await Hive.findById(event.hiveID);
    if (!hive.members.includes(user._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Log interaction
    const interactionLog = new InteractionLog({
      userID: user._id,
      hiveID: event.hiveID,
      eventID: event._id,
      swipeDirection,
      responseTime: responseTime || 0,
      emotionData,
      gpsData
    });
    await interactionLog.save();

    // Update event
    const swipeLog = {
      userID: user._id,
      swipeDirection,
      responseTime: responseTime || 0,
      emotionData,
      timestamp: new Date()
    };
    event.swipeLogs.push(swipeLog);

    if (swipeDirection === 'right') {
      if (!event.acceptedBy.includes(user._id)) {
        event.acceptedBy.push(user._id);
      }
      event.declinedBy = event.declinedBy.filter(id => id.toString() !== user._id.toString());
    } else {
      if (!event.declinedBy.includes(user._id)) {
        event.declinedBy.push(user._id);
      }
      event.acceptedBy = event.acceptedBy.filter(id => id.toString() !== user._id.toString());
    }

    // Check if event should be confirmed
    const allMembersResponded = hive.members.every(memberId => 
      event.acceptedBy.includes(memberId) || event.declinedBy.includes(memberId)
    );

    if (allMembersResponded) {
      const acceptanceRate = event.acceptedBy.length / hive.members.length;
      if (acceptanceRate >= 0.5) { // At least 50% acceptance
        event.status = 'confirmed';
        // Select most popular proposed time
        event.confirmedTime = event.proposedTimes[0];
      } else {
        event.status = 'cancelled';
      }
    }

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify user is creator or hive member
    const user = await User.findOne({ email: req.user.email });
    if (event.createdBy.toString() !== user._id.toString()) {
      const hive = await Hive.findById(event.hiveID);
      if (!hive.members.includes(user._id)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    // Validate and clean location if being updated
    if (req.body.location) {
      const coords = req.body.location.coordinates;
      if (coords && Array.isArray(coords) && coords.length === 2 && 
          coords.every(c => typeof c === 'number')) {
        req.body.location = {
          type: 'Point',
          coordinates: [coords[0], coords[1]],
          address: req.body.location.address || '',
          name: req.body.location.name || ''
        };
      } else {
        req.body.location = null;
      }
    }
    
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

