import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  hiveID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hive',
    required: true
  },
  uploaderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileURL: {
    type: String, // URL to Firebase Storage or GridFS
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'livephoto'],
    required: true
  },
  facialSentiment: {
    type: Object, // Results from Vertex AI Vision analysis
    default: null
  },
  caption: {
    type: String,
    trim: true
  },
  reviews: [{
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

mediaSchema.index({ eventID: 1 });
mediaSchema.index({ hiveID: 1 });

export default mongoose.model('Media', mediaSchema);

