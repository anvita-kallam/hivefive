/**
 * Script to fix existing events with invalid location data (missing type field)
 * Run with: node scripts/fix-event-locations.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Event from '../src/models/Event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function fixEventLocations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all events with location data
    const events = await Event.find({
      location: { $exists: true, $ne: null }
    });
    
    console.log(`Found ${events.length} events with location data`);
    
    let fixedEvents = 0;
    let removedLocations = 0;
    
    for (const event of events) {
      if (event.location && event.location.coordinates) {
        const coords = event.location.coordinates;
        // Check if coordinates are valid
        if (Array.isArray(coords) && coords.length === 2 && 
            coords.every(c => typeof c === 'number')) {
          // Add type field if missing or invalid
          if (!event.location.type || event.location.type !== 'Point') {
            event.location.type = 'Point';
            // Ensure coordinates are properly formatted
            event.location.coordinates = [coords[0], coords[1]];
            await event.save();
            fixedEvents++;
            console.log(`✅ Fixed event: "${event.title}" (${event._id}) - Added type: Point`);
          }
        } else {
          // Invalid coordinates - remove location
          event.location = undefined;
          await event.save();
          removedLocations++;
          console.log(`⚠️  Removed invalid location from event: "${event.title}" (${event._id})`);
        }
      } else if (event.location && !event.location.coordinates) {
        // Location exists but has no coordinates - remove it
        event.location = undefined;
        await event.save();
        removedLocations++;
        console.log(`⚠️  Removed location without coordinates from event: "${event.title}" (${event._id})`);
      }
    }
    
    console.log(`\n✅ Fixed ${fixedEvents} events`);
    console.log(`⚠️  Removed ${removedLocations} invalid locations`);
    
    console.log('✅ Done! All event locations have been fixed.');
    
  } catch (error) {
    console.error('Error fixing event locations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixEventLocations();

