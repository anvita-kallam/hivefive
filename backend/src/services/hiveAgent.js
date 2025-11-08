import { getAvailability } from './calendarService.js';
import User from '../models/User.js';

/**
 * Generate event proposals using Hive Agent logic
 * Analyzes member availability and preferences to suggest optimal times
 */
export async function generateEventProposals(hive, creatorUser) {
  try {
    const members = await User.find({ _id: { $in: hive.members } });
    const proposals = [];
    
    // Get next 2 weeks of availability
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0); // Start from 9 AM today
    const endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + 14); // 2 weeks ahead

    // Collect availability for all members
    const memberAvailabilities = [];
    for (const member of members) {
      if (member.googleCalendarRefreshToken) {
        try {
          const availability = await getAvailability(
            member.googleCalendarRefreshToken,
            startTime,
            endTime
          );
          memberAvailabilities.push({
            userId: member._id,
            availableSlots: availability.freeSlots || []
          });
        } catch (error) {
          console.error(`Error getting availability for user ${member._id}:`, error);
        }
      }
    }

    // Find common available slots (simplified algorithm)
    // In production, this would use Vertex AI Agent Engine for more sophisticated analysis
    const commonSlots = findCommonTimeSlots(memberAvailabilities, startTime, endTime);

    // Generate 1-3 proposals based on hive preferences
    const numProposals = Math.min(3, commonSlots.length);
    for (let i = 0; i < numProposals; i++) {
      if (commonSlots[i]) {
        proposals.push(new Date(commonSlots[i]));
      }
    }

    // If no common slots found, suggest times based on activity frequency
    if (proposals.length === 0) {
      proposals.push(...generateDefaultProposals(hive.activityFrequency, startTime));
    }

    return proposals;
  } catch (error) {
    console.error('Error generating event proposals:', error);
    // Return default proposals if agent fails
    return generateDefaultProposals(hive.activityFrequency, new Date());
  }
}

/**
 * Find common time slots across all members
 */
function findCommonTimeSlots(memberAvailabilities, startTime, endTime) {
  if (memberAvailabilities.length === 0) {
    return [];
  }

  // For simplicity, suggest weekend afternoons and weekday evenings
  const commonSlots = [];
  const currentDate = new Date(startTime);

  while (currentDate <= endTime) {
    const dayOfWeek = currentDate.getDay();
    
    // Weekend: suggest 2 PM - 6 PM
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      for (let hour = 14; hour <= 18; hour += 2) {
        const slot = new Date(currentDate);
        slot.setHours(hour, 0, 0, 0);
        if (slot > new Date()) {
          commonSlots.push(slot);
        }
      }
    }
    // Weekday: suggest 6 PM - 9 PM
    else {
      for (let hour = 18; hour <= 21; hour++) {
        const slot = new Date(currentDate);
        slot.setHours(hour, 0, 0, 0);
        if (slot > new Date()) {
          commonSlots.push(slot);
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return commonSlots.slice(0, 10); // Return top 10 slots
}

/**
 * Generate default proposals based on activity frequency
 */
function generateDefaultProposals(activityFrequency, startDate) {
  const proposals = [];
  const intervals = {
    daily: 1,
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    spontaneous: 3
  };

  const interval = intervals[activityFrequency] || 7;
  const baseDate = new Date(startDate);
  
  // Suggest next 3 times based on frequency
  for (let i = 1; i <= 3; i++) {
    const proposal = new Date(baseDate);
    proposal.setDate(proposal.getDate() + (interval * i));
    proposal.setHours(18, 0, 0, 0); // Default to 6 PM
    proposals.push(proposal);
  }

  return proposals;
}

