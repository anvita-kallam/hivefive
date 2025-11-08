import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import Hive from '../models/Hive.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { generateBuzzResponse, shouldTriggerBuzz, generateEventFollowUp } from '../services/buzzService.js';

const router = express.Router();

// Get chat messages for a hive
router.get('/:hiveId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hive = await Hive.findById(req.params.hiveId);
    if (!hive) {
      return res.status(404).json({ error: 'Hive not found' });
    }

    // Check if user is a member of the hive
    if (!hive.members.some(id => id.toString() === user._id.toString())) {
      return res.status(403).json({ error: 'You are not a member of this hive' });
    }

    // Get chat messages (most recent first, limit to last 100)
    const limit = parseInt(req.query.limit) || 100;
    const messages = await Chat.find({ hiveId: req.params.hiveId })
      .populate('sender', 'name profilePhoto email')
      .populate('mentions', 'name')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Convert reactions Map to object for JSON response
    const messagesWithReactions = messages.map(msg => {
      if (msg.reactions instanceof Map) {
        msg.reactions = Object.fromEntries(msg.reactions);
      } else if (msg.reactions && typeof msg.reactions === 'object') {
        // Already an object, but ensure arrays are properly formatted
        const reactionsObj = {};
        Object.entries(msg.reactions).forEach(([emoji, userIds]) => {
          reactionsObj[emoji] = Array.isArray(userIds) ? userIds : [userIds];
        });
        msg.reactions = reactionsObj;
      }
      return msg;
    });

    // Reverse to get chronological order
    res.json(messagesWithReactions.reverse());
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send a chat message
router.post('/:hiveId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hive = await Hive.findById(req.params.hiveId);
    if (!hive) {
      return res.status(404).json({ error: 'Hive not found' });
    }

    // Check if user is a member of the hive
    if (!hive.members.some(id => id.toString() === user._id.toString())) {
      return res.status(403).json({ error: 'You are not a member of this hive' });
    }

    const { message, eventId, mentions = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Create user message
    const chatMessage = new Chat({
      hiveId: req.params.hiveId,
      sender: user._id,
      message: message.trim(),
      isBuzzMessage: false,
      mentions: mentions || [],
      eventId: eventId || null
    });

    await chatMessage.save();
    await chatMessage.populate('sender', 'name profilePhoto email');
    await chatMessage.populate('mentions', 'name');

    // Check if we should trigger Buzz
    let buzzMessage = null;
    if (await shouldTriggerBuzz(message, eventId)) {
      // Get recent conversation history (include the message we just saved)
      const recentMessages = await Chat.find({ hiveId: req.params.hiveId })
        .populate('sender', 'name')
        .sort({ timestamp: -1 })
        .limit(10)
        .then(msgs => msgs.reverse());

      // Generate Buzz response
      const buzzResponse = await generateBuzzResponse(
        req.params.hiveId,
        recentMessages,
        message,
        user._id
      );

      // Create and save Buzz message
      buzzMessage = new Chat({
        hiveId: req.params.hiveId,
        sender: null, // Buzz doesn't have a user ID
        message: buzzResponse,
        isBuzzMessage: true,
        mentions: [],
        eventId: eventId || null,
        metadata: {
          triggeredBy: user._id,
          triggerMessage: message
        }
      });

      await buzzMessage.save();
    }

    // Return user message and optionally Buzz response
    res.json({
      userMessage: chatMessage,
      buzzMessage: buzzMessage
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add reaction to a message
router.post('/:hiveId/messages/:messageId/reactions', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { emoji } = req.body;
    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await Chat.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is a member of the hive
    const hive = await Hive.findById(message.hiveId);
    if (!hive.members.some(id => id.toString() === user._id.toString())) {
      return res.status(403).json({ error: 'You are not a member of this hive' });
    }

    // Initialize reactions map if needed
    if (!message.reactions) {
      message.reactions = new Map();
    }

    // Convert Map to object for easier manipulation
    const reactionsObj = {};
    if (message.reactions instanceof Map) {
      message.reactions.forEach((value, key) => {
        reactionsObj[key] = Array.isArray(value) ? value : [value];
      });
    } else if (typeof message.reactions === 'object') {
      Object.assign(reactionsObj, message.reactions);
    }

    // Get current reactions for this emoji
    const currentReactions = reactionsObj[emoji] || [];
    
    // Toggle reaction (add if not present, remove if present)
    const userIndex = currentReactions.findIndex(id => 
      (typeof id === 'object' ? id._id?.toString() : id?.toString()) === user._id.toString()
    );
    
    if (userIndex >= 0) {
      currentReactions.splice(userIndex, 1);
    } else {
      currentReactions.push(user._id);
    }

    // Update reactions
    if (currentReactions.length === 0) {
      delete reactionsObj[emoji];
    } else {
      reactionsObj[emoji] = currentReactions;
    }

    // Convert back to Map
    message.reactions = new Map(Object.entries(reactionsObj));

    await message.save();
    await message.populate('sender', 'name profilePhoto email');

    // Convert reactions Map to object for JSON response
    const messageObj = message.toObject();
    if (messageObj.reactions instanceof Map) {
      messageObj.reactions = Object.fromEntries(messageObj.reactions);
    }

    res.json(messageObj);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger Buzz for event follow-up (called when event is created)
router.post('/:hiveId/event-followup/:eventId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hive = await Hive.findById(req.params.hiveId);
    if (!hive) {
      return res.status(404).json({ error: 'Hive not found' });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Generate follow-up question from Buzz
    const followUp = await generateEventFollowUp(req.params.eventId);

    if (followUp) {
      const buzzMessage = new Chat({
        hiveId: req.params.hiveId,
        sender: null,
        message: followUp,
        isBuzzMessage: true,
        eventId: req.params.eventId,
        metadata: {
          type: 'event_followup',
          eventTitle: event.title
        }
      });

      await buzzMessage.save();
      res.json(buzzMessage);
    } else {
      res.json({ message: 'No follow-up generated' });
    }
  } catch (error) {
    console.error('Error generating event follow-up:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

