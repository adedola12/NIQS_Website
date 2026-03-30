const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  volume:      { type: Number },
  issue:       { type: Number },
  year:        { type: Number },
  description: { type: String, trim: true, default: '' },
  coverImage:  { type: String, trim: true, default: '' },
  fileUrl:     { type: String, trim: true, default: '' },
  fileSize:    { type: Number, default: 0 },
  storage:     { type: String, enum: ['cloudinary', 'r2', 'local'], default: 'local' },
  isPublished: { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Journal', journalSchema);
