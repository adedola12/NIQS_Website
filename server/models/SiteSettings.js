const mongoose = require('mongoose');

/* Singleton settings document — only one record ever exists (_id: 'global') */
const siteSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },

  /* External partner / affiliate links */
  waqsnUrl:       { type: String, trim: true, default: '' },
  qsrbnUrl:       { type: String, trim: true, default: '' },
  pagsUrl:        { type: String, trim: true, default: '' },

  /* Social media */
  twitterUrl:     { type: String, trim: true, default: '' },
  facebookUrl:    { type: String, trim: true, default: '' },
  linkedinUrl:    { type: String, trim: true, default: '' },
  youtubeUrl:     { type: String, trim: true, default: '' },
  instagramUrl:   { type: String, trim: true, default: '' },

  /* YQSF stats (admin-editable; shown on YQSF public page) */
  yqsfCpdEvents:  { type: String, trim: true, default: '' }, // e.g. "40"
  yqsfTotalAwards:{ type: String, trim: true, default: '' }, // e.g. "10+"

  /* Homepage banner / ticker items — shown in the scrolling ticker bar */
  bannerItems:    { type: [String], default: [] },

  /* Contact overrides (shown in footer / contact page) */
  phone1:         { type: String, trim: true, default: '' },
  phone2:         { type: String, trim: true, default: '' },
  email1:         { type: String, trim: true, default: '' },
  email2:         { type: String, trim: true, default: '' },
  address:        { type: String, trim: true, default: '' },
  officeHours:    { type: String, trim: true, default: '' },
}, { _id: false, timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
