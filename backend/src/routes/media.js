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
    
    console.log('📸 Fetched media for event:', {
      eventId: req.params.eventId,
      totalMedia: media.length,
      reactions: media.filter(m => m.isReaction).length,
      photos: media.filter(m => !m.isReaction).length
    });
    
    res.json(media);
  } catch (error) {
    console.error('❌ Error fetching event media:', error);
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
    const { eventID, fileURL, fileType, caption, facialSentiment, isReaction, swipeDirection } = req.body;

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // For reactions, use the provided facialSentiment from face-api.js
    // For other media, analyze using Vertex AI Vision if no sentiment provided
    let finalSentiment = facialSentiment;
    if (!finalSentiment && !isReaction) {
      try {
        finalSentiment = await analyzeMediaSentiment(fileURL, fileType);
      } catch (error) {
        console.error('Error analyzing media sentiment:', error);
        // Continue without sentiment analysis
      }
    }

    const media = new Media({
      eventID,
      hiveID: event.hiveID,
      uploaderID: user._id,
      fileURL,
      fileType,
      caption,
      facialSentiment: finalSentiment,
      isReaction: isReaction === true, // Explicitly set to boolean
      swipeDirection: swipeDirection || null
    });

    await media.save();

    console.log('✅ Media saved:', {
      mediaId: media._id,
      eventID: eventID,
      hiveID: event.hiveID,
      fileType: fileType,
      isReaction: media.isReaction,
      hasSentiment: !!finalSentiment,
      uploaderID: user._id
    });

    // Update event sentiment scores
    if (finalSentiment) {
      const sentimentScore = finalSentiment.sentiment || finalSentiment.overallSentiment || 0;
      event.sentimentScores.set(user._id.toString(), sentimentScore);
      await event.save();
    }

    // Populate uploader before returning
    const populatedMedia = await Media.findById(media._id)
      .populate('uploaderID', 'name profilePhoto');

    res.status(201).json(populatedMedia);
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

