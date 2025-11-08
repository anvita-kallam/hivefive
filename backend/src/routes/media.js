import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Media from '../models/Media.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { analyzeMediaSentiment } from '../services/vertexAI.js';

const router = express.Router();

// Get media for an event
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const media = await Media.find({ eventID: req.params.eventId })
      .populate('uploaderID', 'name profilePhoto')
      .populate('reviews.userID', 'name profilePhoto')
      .sort({ timestamp: -1 });
    
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get media for a hive
router.get('/hive/:hiveId', authenticateToken, async (req, res) => {
  try {
    const media = await Media.find({ hiveID: req.params.hiveId })
      .populate('uploaderID', 'name profilePhoto')
      .populate('reviews.userID', 'name profilePhoto')
      .sort({ timestamp: -1 });
    
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload media
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const { eventID, fileURL, fileType, caption } = req.body;

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Analyze media sentiment using Vertex AI Vision
    const facialSentiment = await analyzeMediaSentiment(fileURL, fileType);

    const media = new Media({
      eventID,
      hiveID: event.hiveID,
      uploaderID: user._id,
      fileURL,
      fileType,
      caption,
      facialSentiment
    });

    await media.save();

    // Update event sentiment scores
    if (facialSentiment && facialSentiment.overallSentiment) {
      event.sentimentScores.set(user._id.toString(), facialSentiment.overallSentiment);
      await event.save();
    }

    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add review to media
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const { text, rating } = req.body;

    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Check if user already reviewed
    const existingReview = media.reviews.find(r => r.userID.toString() === user._id.toString());
    if (existingReview) {
      return res.status(400).json({ error: 'Review already exists' });
    }

    media.reviews.push({
      userID: user._id,
      text,
      rating
    });

    await media.save();
    res.json(media);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

