const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  tier:         { type: String, enum: ['platinum', 'gold', 'silver', 'bronze', 'associate'], default: 'gold' },
  logo:         { type: String },
  coverImage:   { type: String },
  description:  { type: String },
  benefits:     [{ type: String }],
  website:      { type: String },
  contactEmail: { type: String },
  phone:        { type: String },
  // Location details (shown on partner detail page)
  address:      { type: String },
  city:         { type: String },
  state:        { type: String },
  country:      { type: String, default: 'Nigeria' },
  industry:     { type: String },
  founded:      { type: String },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);
