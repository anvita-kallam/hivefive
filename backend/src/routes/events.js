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
      .populate({
        path: 'swipeLogs.reactionMediaId',
        select: 'fileURL fileType facialSentiment caption uploaderID',
        populate: {
          path: 'uploaderID',
          select: 'name profilePhoto'
        }
      })
      .populate('swipeLogs.userID', 'name profilePhoto')
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
      .populate('declinedBy', 'name profilePhoto')
      .populate({
        path: 'swipeLogs.reactionMediaId',
        select: 'fileURL fileType facialSentiment caption uploaderID',
        populate: {
          path: 'uploaderID',
          select: 'name profilePhoto'
        }
      })
      .populate('swipeLogs.userID', 'name profilePhoto');
    
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

// Swipe on event (or change swipe status)
router.post('/:id/swipe', authenticateToken, async (req, res) => {
  try {
    console.log('Swipe request received:', {
      eventId: req.params.id,
      body: req.body,
      userEmail: req.user.email
    });

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      console.error('User not found:', req.user.email);
      return res.status(404).json({ error: 'User not found' });
    }

    const { swipeDirection, responseTime, emotionData, reactionMediaId, gpsData } = req.body;

    // Validate swipeDirection
    if (!swipeDirection || (swipeDirection !== 'left' && swipeDirection !== 'right')) {
      console.error('Invalid swipeDirection:', swipeDirection);
      return res.status(400).json({ error: 'swipeDirection must be "left" or "right"' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      console.error('Event not found:', req.params.id);
      return res.status(404).json({ error: 'Event not found' });
    }

    const hive = await Hive.findById(event.hiveID);
    if (!hive) {
      console.error('Hive not found:', event.hiveID);
      return res.status(404).json({ error: 'Hive not found' });
    }

    if (!hive.members.some(id => id.toString() === user._id.toString())) {
      console.error('User not a member of hive:', { userId: user._id, hiveId: hive._id });
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if user has already swiped (to allow changing)
    const existingSwipeIndex = event.swipeLogs.findIndex(log => 
      log.userID.toString() === user._id.toString()
    );
    
    // Log interaction (even if changing)
    try {
      const interactionLogData = {
        userID: user._id,
        hiveID: event.hiveID,
        eventID: event._id,
        swipeDirection,
        responseTime: responseTime || 0,
        emotionData: emotionData || null
      };
      
      // Only add gpsData if provided and valid
      if (gpsData && gpsData.coordinates && Array.isArray(gpsData.coordinates)) {
        interactionLogData.gpsData = {
          type: 'Point',
          coordinates: gpsData.coordinates
        };
      }
      
      const interactionLog = new InteractionLog(interactionLogData);
      await interactionLog.save();
    } catch (logError) {
      console.warn('Failed to save interaction log:', logError.message);
      console.warn('Log error details:', logError);
      // Don't fail the request if logging fails
    }

    // Update or add swipe log
    if (existingSwipeIndex !== -1) {
      // Remove the old swipe log
      event.swipeLogs.splice(existingSwipeIndex, 1);
    }
    
    // Add new/updated swipe log
    const swipeLog = {
      userID: user._id,
      swipeDirection,
      responseTime: responseTime || 0,
      emotionData: emotionData || null,
      reactionMediaId: reactionMediaId || null,
      timestamp: new Date()
    };
    event.swipeLogs.push(swipeLog);

    // Update accepted/declined arrays
    if (swipeDirection === 'right') {
      // Accept: add to acceptedBy, remove from declinedBy
      const userAccepted = event.acceptedBy.some(id => id.toString() === user._id.toString());
      const userDeclined = event.declinedBy.some(id => id.toString() === user._id.toString());
      
      if (!userAccepted) {
        event.acceptedBy.push(user._id);
      }
      if (userDeclined) {
        event.declinedBy = event.declinedBy.filter(id => id.toString() !== user._id.toString());
      }
    } else if (swipeDirection === 'left') {
      // Decline: add to declinedBy, remove from acceptedBy
      const userAccepted = event.acceptedBy.some(id => id.toString() === user._id.toString());
      const userDeclined = event.declinedBy.some(id => id.toString() === user._id.toString());
      
      if (!userDeclined) {
        event.declinedBy.push(user._id);
      }
      if (userAccepted) {
        event.acceptedBy = event.acceptedBy.filter(id => id.toString() !== user._id.toString());
      }
    } else {
      return res.status(400).json({ error: 'Invalid swipeDirection. Must be "left" or "right".' });
    }

    // Re-check if event should be confirmed/cancelled
    const allMembersResponded = hive.members.every(memberId => 
      event.acceptedBy.some(id => id.toString() === memberId.toString()) || 
      event.declinedBy.some(id => id.toString() === memberId.toString())
    );

    if (allMembersResponded && event.status === 'proposed') {
      const acceptanceRate = event.acceptedBy.length / hive.members.length;
      if (acceptanceRate >= 0.5) { // At least 50% acceptance
        event.status = 'confirmed';
        // Select most popular proposed time
        event.confirmedTime = event.proposedTimes[0];
      } else {
        event.status = 'cancelled';
      }
    } else if (!allMembersResponded && (event.status === 'confirmed' || event.status === 'cancelled')) {
      // If someone changed their vote and not all members have responded, reset to proposed
      event.status = 'proposed';
      event.confirmedTime = null;
    }

    // Save the event
    try {
      await event.save();
      console.log('Event saved successfully');
    } catch (saveError) {
      console.error('Error saving event:', saveError);
      console.error('Save error details:', {
        message: saveError.message,
        name: saveError.name,
        errors: saveError.errors,
        stack: saveError.stack
      });
      throw saveError;
    }
    
    // Populate the response for consistency
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name profilePhoto')
      .populate('acceptedBy', 'name profilePhoto')
      .populate('declinedBy', 'name profilePhoto')
      .populate({
        path: 'swipeLogs.reactionMediaId',
        select: 'fileURL fileType facialSentiment caption uploaderID',
        populate: {
          path: 'uploaderID',
          select: 'name profilePhoto'
        }
      })
      .populate('swipeLogs.userID', 'name profilePhoto');
    
    console.log('Swipe update successful');
    res.json(populatedEvent);
  } catch (error) {
    console.error('Error updating event swipe:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    const errorMessage = error.message || 'Failed to update swipe status';
    const statusCode = error.name === 'ValidationError' ? 400 : 
                       error.name === 'CastError' ? 400 : 500;
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify user is creator of the event
    const user = await User.findOne({ email: req.user.email });
    if (event.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Only the event creator can delete this event' });
    }

    // Delete associated media (optional - you may want to keep media)
    // For now, we'll just delete the event and let media remain

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

