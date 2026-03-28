const mongoose = require('mongoose');

const pastPresidentSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },   // e.g. "Arc. Dr. [Name], FNIQS"
  term:     { type: String, required: true, trim: true },   // e.g. "2020 – 2024"
  info:     { type: String, trim: true, default: '' },      // optional: state or note
  image:    { type: String, default: '' },                   // portrait URL
  linkedIn: { type: String, trim: true, default: '' },      // LinkedIn profile URL
  order:    { type: Number, default: 0 },                    // lower = displayed first (most recent)
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('PastPresident', pastPresidentSchema);
