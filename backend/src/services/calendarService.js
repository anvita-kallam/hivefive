import { google } from 'googleapis';

/**
 * Get user's calendar availability
 */
export async function getAvailability(refreshToken, startTime, endTime) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get busy times
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        items: [{ id: 'primary' }]
      }
    });

    const busyTimes = response.data.calendars?.primary?.busy || [];
    
    // Calculate free slots (simplified - returns hourly slots)
    const freeSlots = calculateFreeSlots(busyTimes, startTime, endTime);

    return {
      busyTimes,
      freeSlots,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString()
    };
  } catch (error) {
    console.error('Error getting calendar availability:', error);
    throw error;
  }
}

/**
 * Calculate free time slots from busy times
 */
function calculateFreeSlots(busyTimes, startTime, endTime) {
  const freeSlots = [];
  let currentTime = new Date(startTime);

  // Sort busy times by start
  const sortedBusy = [...busyTimes].sort((a, b) => 
    new Date(a.start) - new Date(b.start)
  );

  for (const busy of sortedBusy) {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);

    // Add free slot before this busy period
    if (currentTime < busyStart) {
      freeSlots.push({
        start: currentTime.toISOString(),
        end: busyStart.toISOString()
      });
    }

    currentTime = busyEnd > currentTime ? busyEnd : currentTime;
  }

  // Add remaining free time after last busy period
  if (currentTime < endTime) {
    freeSlots.push({
      start: currentTime.toISOString(),
      end: endTime.toISOString()
    });
  }

  return freeSlots;
}

/**
 * Create calendar event
 */
export async function createCalendarEvent(refreshToken, eventData) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'America/New_York'
      },
      location: eventData.location
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

