// Test MongoDB Connection using Mongoose
// Run with: node scripts/test-mongodb-connection.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Get connection string from environment or use default
let mongoURI = process.env.MONGODB_URI || "mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/?appName=HiveFive";

// Add database name if not present (same logic as database.js)
if (!mongoURI.includes('/hivefive') && !mongoURI.includes('/?')) {
  if (mongoURI.includes('?')) {
    mongoURI = mongoURI.replace('?', '/hivefive?');
  } else {
    mongoURI = mongoURI + '/hivefive';
  }
}

// Ensure retryWrites and w are in the connection string
if (!mongoURI.includes('retryWrites')) {
  const separator = mongoURI.includes('?') ? '&' : '?';
  mongoURI = mongoURI + `${separator}retryWrites=true&w=majority`;
}

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    // Hide password in logs
    const logURI = mongoURI.replace(/\/\/.*@/, '//***:***@');
    console.log('Connection string:', logURI);
    
    // MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };
    
    // Connect using Mongoose
    const conn = await mongoose.connect(mongoURI, options);
    console.log("✅ Successfully connected to MongoDB!");
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Test database operations
    const db = conn.connection.db;
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`✅ Available collections (${collections.length}):`, collections.map(c => c.name).join(', '));
    
    // Test User collection
    const User = mongoose.connection.collection('users');
    const userCount = await User.countDocuments();
    console.log(`✅ Users collection has ${userCount} document(s)`);
    
    // Test Hive collection
    const Hive = mongoose.connection.collection('hives');
    const hiveCount = await Hive.countDocuments();
    console.log(`✅ Hives collection has ${hiveCount} document(s)`);
    
    // Test Event collection
    const Event = mongoose.connection.collection('events');
    const eventCount = await Event.countDocuments();
    console.log(`✅ Events collection has ${eventCount} document(s)`);
    
    console.log("");
    console.log("✅ MongoDB connection test successful!");
    
  } catch (error) {
    console.error("");
    console.error("❌ Error connecting to MongoDB:");
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);
    console.error("Error codeName:", error.codeName);
    
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      console.error("");
      console.error("🚨 CONNECTION FAILED!");
      console.error("");
      console.error("Common causes:");
      console.error("1. MongoDB Atlas Network Access not configured");
      console.error("   → Go to MongoDB Atlas → Network Access");
      console.error("   → Click 'Add IP Address'");
      console.error("   → Click 'Allow Access from Anywhere'");
      console.error("   → Enter: 0.0.0.0/0");
      console.error("   → Click 'Confirm'");
      console.error("   → Wait 1-2 minutes for changes to propagate");
      console.error("");
      console.error("2. Connection string incorrect");
      console.error("   → Verify username: kranvita007_db_user");
      console.error("   → Verify password: Ga9tXmIA156MFaT2");
      console.error("   → Verify cluster: hivefive.anukffg.mongodb.net");
      console.error("");
      console.error("3. Database user credentials incorrect");
      console.error("   → Check MongoDB Atlas → Database Access");
      console.error("   → Find user: kranvita007_db_user");
      console.error("   → Verify user has 'Read and write to any database' permissions");
      console.error("   → If password is wrong, reset it and update Railway");
    }
    
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("✅ Connection closed");
    process.exit(0);
  }
}

testConnection().catch(console.error);

