const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tier: { type: String, enum: ['platinum', 'gold', 'silver', 'bronze'], default: 'silver' },
  logo: { type: String },
  description: { type: String },
  benefits: [{ type: String }],
  price: { type: String },
  website: { type: String },
  contactEmail: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);
