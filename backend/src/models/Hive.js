import mongoose from 'mongoose';

const hiveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 2;
      },
      message: 'Hive must have at least 2 members'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  hiveAgentID: {
    type: String, // Vertex AI Agent ID
    default: null
  },
  activityFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'spontaneous'],
    default: 'weekly'
  },
  settings: {
    autoPlanEvents: { type: Boolean, default: true },
    requireAllAccept: { type: Boolean, default: false },
    defaultLocation: {
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
      }
    }
  }
});

// Pre-save hook to clean up invalid location data
hiveSchema.pre('save', function(next) {
  // Remove defaultLocation if coordinates are null or invalid
  if (this.settings?.defaultLocation) {
    const coords = this.settings.defaultLocation.coordinates;
    if (!coords || !Array.isArray(coords) || coords.length !== 2 || 
        coords.some(c => typeof c !== 'number')) {
      // If coordinates are invalid, remove the location entirely
      this.settings.defaultLocation = undefined;
    }
  }
  next();
});

// Sparse index for geospatial queries (only indexes documents with valid location)
hiveSchema.index({ 'settings.defaultLocation': '2dsphere' }, { sparse: true });

export default mongoose.model('Hive', hiveSchema);

