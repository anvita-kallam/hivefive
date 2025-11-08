/**
 * Script to fix existing hives and events with invalid location data
 * Run with: node scripts/fix-invalid-locations.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Hive from '../src/models/Hive.js';
import Event from '../src/models/Event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

async function fixInvalidLocations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fix Hives with invalid defaultLocation
    const hives = await Hive.find({
      'settings.defaultLocation.coordinates': null
    });
    
    console.log(`Found ${hives.length} hives with null coordinates`);
    
    let fixedHives = 0;
    for (const hive of hives) {
      if (hive.settings?.defaultLocation?.coordinates === null) {
        // Remove invalid location
        hive.settings.defaultLocation = undefined;
        await hive.save();
        fixedHives++;
        console.log(`Fixed hive: ${hive.name} (${hive._id})`);
      }
    }
    
    console.log(`Fixed ${fixedHives} hives`);

    // Fix Events with invalid location
    const events = await Event.find({
      'location.coordinates': null
    });
    
    console.log(`Found ${events.length} events with null coordinates`);
    
    let fixedEvents = 0;
    for (const event of events) {
      if (event.location?.coordinates === null) {
        // Remove invalid location
        event.location = undefined;
        await event.save();
        fixedEvents++;
        console.log(`Fixed event: ${event.title} (${event._id})`);
      }
    }
    
    console.log(`Fixed ${fixedEvents} events`);
    
    console.log('✅ Done! All invalid locations have been fixed.');
    
  } catch (error) {
    console.error('Error fixing locations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixInvalidLocations();

