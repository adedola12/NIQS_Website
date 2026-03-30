const mongoose = require('mongoose');

const webinarSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  description:     { type: String, trim: true, default: '' },
  date:            { type: Date },
  speaker:         { type: String, trim: true, default: '' },
  speakerTitle:    { type: String, trim: true, default: '' },
  category:        { type: String, trim: true, default: 'General' }, // 'Technology', 'Legal', 'Sustainability', etc.
  scope:           { type: String, enum: ['national', 'chapter', 'yqsf', 'waqsn'], default: 'national' },
  chapter:         { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  thumbnailUrl:    { type: String, trim: true, default: '' },
  recordingUrl:    { type: String, trim: true, default: '' }, // for past webinars
  registrationUrl: { type: String, trim: true, default: '' }, // for upcoming
  isUpcoming:      { type: Boolean, default: true },
  isPublished:     { type: Boolean, default: true },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Webinar', webinarSchema);
