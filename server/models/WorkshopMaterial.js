const mongoose = require('mongoose');

const workshopMaterialSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  description:   { type: String, trim: true, default: '' },
  type:          { type: String, enum: ['slides', 'template', 'reading', 'video', 'other'], default: 'slides' },
  scope:         { type: String, enum: ['national', 'chapter', 'yqsf', 'waqsn'], default: 'national' },
  chapter:       { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  workshopTitle: { type: String, trim: true, default: '' }, // Parent workshop name
  workshopDate:  { type: Date },
  fileUrl:       { type: String, trim: true, default: '' },
  thumbnailUrl:  { type: String, trim: true, default: '' },
  fileSize:      { type: Number, default: 0 },
  storage:       { type: String, enum: ['cloudinary', 'r2', 'local'], default: 'local' },
  isPublished:   { type: Boolean, default: true },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('WorkshopMaterial', workshopMaterialSchema);
