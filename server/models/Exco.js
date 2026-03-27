const mongoose = require('mongoose');

const excoSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  state: { type: String, trim: true, default: '' },          // e.g. "Lagos State"
  linkedIn: { type: String, trim: true, default: '' },       // LinkedIn profile URL
  image: { type: String },
  bio: { type: String },
  email: { type: String, trim: true },
  phone: { type: String },
  scope: { type: String, enum: ['national', 'npc', 'chapter'], default: 'national' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', default: null },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Exco', excoSchema);
