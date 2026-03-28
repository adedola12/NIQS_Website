const mongoose = require('mongoose');

/* One singleton record per body — _id is the body type */
const contactInfoSchema = new mongoose.Schema({
  _id:         { type: String },          // 'national' | 'waqsn' | 'yqsf'
  label:       { type: String, default: '' }, // display name e.g. "National Secretariat"
  phone1:      { type: String, trim: true, default: '' },
  phone2:      { type: String, trim: true, default: '' },
  email1:      { type: String, trim: true, default: '' },
  email2:      { type: String, trim: true, default: '' },
  address:     { type: String, trim: true, default: '' },
  officeHours: { type: String, trim: true, default: '' },
  websiteUrl:  { type: String, trim: true, default: '' },
  twitterUrl:  { type: String, trim: true, default: '' },
  facebookUrl: { type: String, trim: true, default: '' },
  linkedinUrl: { type: String, trim: true, default: '' },
  instagramUrl:{ type: String, trim: true, default: '' },
}, { _id: false, timestamps: true });

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
