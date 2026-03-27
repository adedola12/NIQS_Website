const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true },
  venue: { type: String },
  type: {
    type: String,
    enum: ['conference', 'seminar', 'workshop', 'agm', 'meeting', 'social', 'exam', 'other'],
    default: 'other'
  },
  scope: { type: String, enum: ['national', 'chapter'], default: 'national' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', default: null },
  image: { type: String },
  registrationLink: { type: String },
  isFeatured: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
