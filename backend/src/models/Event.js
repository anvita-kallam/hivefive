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
  },
  reactionMediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
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
      required: false
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
      validate: {
        validator: function(v) {
          // If coordinates exist, must be array of 2 numbers
          if (v === null || v === undefined) return true; // Allow null/undefined
          return Array.isArray(v) && v.length === 2 && 
                 typeof v[0] === 'number' && typeof v[1] === 'number';
        },
        message: 'Coordinates must be an array of 2 numbers [longitude, latitude]'
      }
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

// Pre-save hook to clean up invalid location data and update timestamp
eventSchema.pre('save', function(next) {
  // Validate and fix location data
  if (this.location) {
    const coords = this.location.coordinates;
    if (!coords || !Array.isArray(coords) || coords.length !== 2 || 
        coords.some(c => typeof c !== 'number')) {
      // If coordinates are invalid, remove the location entirely
      this.location = undefined;
    } else {
      // If coordinates are valid, ensure type field is set for GeoJSON
      if (!this.location.type) {
        this.location.type = 'Point';
      }
      // Ensure coordinates are in correct format [longitude, latitude]
      if (Array.isArray(coords) && coords.length === 2) {
        this.location.coordinates = [coords[0], coords[1]];
      }
    }
  }
  
  // Update timestamp
  this.updatedAt = Date.now();
  next();
});

// Sparse index for geospatial queries (only indexes documents with valid location)
eventSchema.index({ location: '2dsphere' }, { sparse: true });
eventSchema.index({ hiveID: 1, status: 1 });

export default mongoose.model('Event', eventSchema);

