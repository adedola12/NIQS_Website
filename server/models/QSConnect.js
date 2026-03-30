const mongoose = require('mongoose');

const qsConnectSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true }, // 'QS Connect Vol. 9.1 — March 2025'
  volume:      { type: String, trim: true, default: '' },    // '9.1'
  issueDate:   { type: String, required: true, trim: true }, // 'March 2025'
  description: { type: String, trim: true, default: '' },
  coverImage:  { type: String, trim: true, default: '' },    // URL
  fileUrl:     { type: String, trim: true, default: '' },    // PDF URL
  fileSize:    { type: Number, default: 0 },                 // bytes
  storage:     { type: String, enum: ['cloudinary', 'r2', 'local'], default: 'local' },
  isFeatured:  { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('QSConnect', qsConnectSchema);
