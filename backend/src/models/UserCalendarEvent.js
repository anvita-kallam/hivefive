import mongoose from 'mongoose';

const userCalendarEventSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    trim: true
  },
  allDay: {
    type: Boolean,
    default: false
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

// Update updatedAt before saving
userCalendarEventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
userCalendarEventSchema.index({ userID: 1, startTime: 1 });
userCalendarEventSchema.index({ userID: 1, startTime: 1, endTime: 1 });

const UserCalendarEvent = mongoose.model('UserCalendarEvent', userCalendarEventSchema);

export default UserCalendarEvent;

