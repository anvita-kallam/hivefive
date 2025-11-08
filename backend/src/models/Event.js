import mongoose from 'mongoose';

const swipeLogSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  swipeDirection: {
    type: String,
    enum: ['left', 'right'],
    required: true
  },
  responseTime: {
    type: Number, // in milliseconds
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  emotionData: {
    type: Object, // Store emotion detection results from camera
    default: null
  }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  hiveID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hive',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  proposedTimes: {
    type: [Date],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one proposed time is required'
    }
  },
  acceptedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  declinedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  confirmedTime: {
    type: Date,
    default: null
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null
    },
    address: String,
    name: String
  },
  swipeLogs: {
    type: [swipeLogSchema],
    default: []
  },
  status: {
    type: String,
    enum: ['proposed', 'confirmed', 'completed', 'cancelled'],
    default: 'proposed'
  },
  sentimentScores: {
    type: Map,
    of: Number, // User ID -> sentiment score
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
eventSchema.index({ location: '2dsphere' });
eventSchema.index({ hiveID: 1, status: 1 });

eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Event', eventSchema);

