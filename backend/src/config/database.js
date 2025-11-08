import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      retryWrites: true,
      w: 'majority'
    };

    // Get connection string
    let mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Add database name to connection string if not present
    if (!mongoURI.includes('/hivefive') && !mongoURI.includes('/?')) {
      // Add database name before query parameters
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

    console.log('Attempting to connect to MongoDB...');
    // Hide password in logs for security
    const logURI = mongoURI.replace(/\/\/.*@/, '//***:***@');
    console.log('Connection string:', logURI);
    
    const conn = await mongoose.connect(mongoURI, options);
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName
    });
    
    // Provide helpful error messages
    if (error.name === 'MongoServerSelectionError') {
      console.error('');
      console.error('🚨 MONGODB CONNECTION FAILED!');
      console.error('');
      console.error('Common causes:');
      console.error('1. MongoDB Atlas Network Access not configured');
      console.error('   → Go to MongoDB Atlas → Network Access');
      console.error('   → Add IP Address: 0.0.0.0/0 (Allow from anywhere)');
      console.error('');
      console.error('2. MONGODB_URI environment variable incorrect');
      console.error('   → Check Railway Variables → MONGODB_URI');
      console.error('   → Verify username, password, and cluster name');
      console.error('');
      console.error('3. Database user credentials incorrect');
      console.error('   → Check MongoDB Atlas → Database Access');
      console.error('   → Verify user has read/write permissions');
      console.error('');
    }
    
    // Don't exit in production - let the app continue and retry
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  Continuing in production mode - connection will retry');
      console.error('⚠️  Please fix MongoDB connection issues');
    } else {
      process.exit(1);
    }
  }
};
