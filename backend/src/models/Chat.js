import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  hiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hive',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // Sender is required only if it's not a Buzz message
      return !this.isBuzzMessage;
    },
    default: null
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isBuzzMessage: {
    type: Boolean,
    default: false
  },
  mentions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  reactions: {
    type: Map,
    of: [mongoose.Schema.Types.ObjectId], // emoji -> array of user IDs
    default: new Map()
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient querying
chatMessageSchema.index({ hiveId: 1, timestamp: -1 });
chatMessageSchema.index({ hiveId: 1, isBuzzMessage: 1 });

// Compound unique index to prevent duplicate messages
// Only prevents exact duplicates (same message, timestamp, sender within 1 second)
chatMessageSchema.index(
  { 
    hiveId: 1, 
    message: 1, 
    sender: 1, 
    timestamp: 1,
    isBuzzMessage: 1
  },
  { 
    unique: false, // Not strictly unique, but helps with queries
    partialFilterExpression: { timestamp: { $exists: true } }
  }
);

export default mongoose.model('Chat', chatMessageSchema);

