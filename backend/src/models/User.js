import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  school: {
    type: String,
    default: '',
    trim: true
  },
  major: {
    type: String,
    trim: true
  },
  hobbies: {
    type: [String],
    default: []
  },
  resHall: {
    type: String,
    trim: true
  },
  hometown: {
    type: String,
    trim: true
  },
  birthday: {
    type: Date
  },
  profilePhoto: {
    type: String, // URL to Firebase Storage or GridFS
    default: null
  },
  hiveIDs: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Hive',
    default: []
  },
  preferences: {
    activityTypes: [String],
    preferredTimes: [String],
    maxDistance: Number, // in miles
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  googleCalendarRefreshToken: {
    type: String,
    default: null
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

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);

