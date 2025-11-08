import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { google } from 'googleapis';
import User from '../models/User.js';
import { getAvailability } from '../services/calendarService.js';

const router = express.Router();

// Get Google Calendar OAuth URL
router.get('/auth-url', authenticateToken, (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({ url });
});

// Handle OAuth callback
router.get('/callback', authenticateToken, async (req, res) => {
  try {
    const { code } = req.query;
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save refresh token to user
    const user = await User.findOne({ email: req.user.email });
    if (user) {
      user.googleCalendarRefreshToken = tokens.refresh_token;
      await user.save();
    }

    res.json({ success: true, message: 'Calendar connected successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user availability
router.get('/availability', authenticateToken, async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    const user = await User.findOne({ email: req.user.email });
    
    if (!user || !user.googleCalendarRefreshToken) {
      return res.status(400).json({ error: 'Calendar not connected' });
    }

    const availability = await getAvailability(
      user.googleCalendarRefreshToken,
      new Date(startTime),
      new Date(endTime)
    );

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

