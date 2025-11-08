import mongoose from 'mongoose';

const interactionLogSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hiveID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hive',
    required: true
  },
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  swipeDirection: {
    type: String,
    enum: ['left', 'right'],
    required: true
  },
  responseTime: {
    type: Number, // in milliseconds
    required: true
  },
  gpsData: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null
    }
  },
  emotionData: {
    type: Object,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

interactionLogSchema.index({ userID: 1, hiveID: 1 });
interactionLogSchema.index({ timestamp: -1 });
interactionLogSchema.index({ gpsData: '2dsphere' });

export default mongoose.model('InteractionLog', interactionLogSchema);

