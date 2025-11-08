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

export default mongoose.model('Chat', chatMessageSchema);

