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
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: null
      }
    }
  }
});

// Index for geospatial queries
hiveSchema.index({ 'settings.defaultLocation': '2dsphere' });

export default mongoose.model('Hive', hiveSchema);

