const mongoose = require('mongoose');

/* ── Flyer design subdocuments (mirrors the NIQS Flyer Engine event shape) ── */
const flyerSpeakerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  credentials: { type: String, default: '' },
  photo: { type: String, default: null }, // uploaded URL (not base64)
  role: { type: String, default: 'Faculty' },
  topic: { type: String, default: '' },
}, { _id: false });

const flyerSchema = new mongoose.Schema({
  category: { type: String, default: 'Training' },     // Training | Webinar
  layout: { type: String, default: 'Left' },           // Left | Center
  theme: { type: String, default: 'Dark' },            // Light | Dark
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  goldWordIndex: { type: Number, default: null },
  dateStart: { type: String, default: '' },            // YYYY-MM-DD
  dateEnd: { type: String, default: '' },              // YYYY-MM-DD
  time: { type: String, default: '' },
  timeZone: { type: String, default: 'WAT' },
  cpdPoints: { type: Number, default: 0 },
  cpdSealVariant: { type: String, default: 'auto' },
  venueType: { type: String, default: 'Hybrid' },      // In-Person | Virtual | Hybrid
  venuePhysical: { type: String, default: '' },
  venueCity: { type: String, default: '' },
  platform: { type: String, default: 'Zoom' },
  platformNote: { type: String, default: '' },
  registrationUrl: { type: String, default: '' },
  registrationExtra: { type: String, default: '' },
  enquiries: { type: [String], default: [] },
  backgroundId: { type: String, default: 'dark-bg-1' },
  accent: { type: String, default: 'glow' },
  selectedSpeakerIndex: { type: Number, default: 0 },
  heroImage: { type: String, default: null },
  schedule: { type: String, default: '' },
  sections: { type: mongoose.Schema.Types.Mixed, default: {} },
  speakers: { type: [flyerSpeakerSchema], default: [] },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true },
  venue: { type: String },
  type: {
    type: String,
    enum: ['conference', 'seminar', 'workshop', 'agm', 'meeting', 'social', 'exam', 'training', 'webinar', 'other'],
    default: 'other'
  },
  scope: { type: String, enum: ['national', 'chapter'], default: 'national' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', default: null },
  image: { type: String },
  registrationLink: { type: String },
  isFeatured: { type: Boolean, default: false },
  // ── Flyer Studio design payload (optional) ──
  flyer: { type: flyerSchema, default: null },
  hasFlyer: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

// Speed up calendar / conflict-range queries
eventSchema.index({ date: 1, endDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
