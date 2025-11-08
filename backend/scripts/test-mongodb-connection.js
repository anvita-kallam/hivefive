// Test MongoDB Connection
// Run with: node scripts/test-mongodb-connection.js

import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || "mongodb+srv://kranvita007_db_user:Ga9tXmIA156MFaT2@hivefive.anukffg.mongodb.net/?appName=HiveFive";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
});

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('Connection string:', uri.replace(/\/\/.*@/, '//***:***@'));
    
    // Connect the client to the server
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    
    // Test database connection
    const db = client.db("hivefive");
    console.log("✅ Connected to database: hivefive");
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log("✅ Available collections:", collections.map(c => c.name).join(', '));
    
    // Test User collection
    const users = db.collection("users");
    const userCount = await users.countDocuments();
    console.log(`✅ Users collection has ${userCount} documents`);
    
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:");
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('');
      console.error('🚨 CONNECTION FAILED!');
      console.error('');
      console.error('Common causes:');
      console.error('1. MongoDB Atlas Network Access not configured');
      console.error('   → Go to MongoDB Atlas → Network Access');
      console.error('   → Add IP Address: 0.0.0.0/0 (Allow from anywhere)');
      console.error('');
      console.error('2. Connection string incorrect');
      console.error('   → Verify username, password, and cluster name');
      console.error('');
      console.error('3. Database user credentials incorrect');
      console.error('   → Check MongoDB Atlas → Database Access');
      console.error('   → Verify user has read/write permissions');
    }
    
    process.exit(1);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("✅ Connection closed");
  }
}

testConnection().catch(console.error);

