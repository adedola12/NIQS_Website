const mongoose = require('mongoose');

/* ── Speaker subdoc (text-only — photos are added by the admin in Flyer Studio) ── */
const requestSpeakerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  credentials: { type: String, default: '' },
  role: { type: String, default: 'Faculty' },
  topic: { type: String, default: '' },
}, { _id: false });

/*
 * A FlyerRequest is the intake record someone (a chapter rep, organiser, sub-admin)
 * fills via the public form. It mirrors the fields a requester can reasonably know —
 * NOT the design choices (theme, layout, background) which the admin picks in the
 * Flyer Studio. It does NOT book a calendar date; only the resulting Event does.
 */
const flyerRequestSchema = new mongoose.Schema({
  // ── Who is asking ──
  requesterName: { type: String, required: true, trim: true },
  requesterEmail: { type: String, required: true, trim: true, lowercase: true },
  requesterPhone: { type: String, default: '' },
  requesterOrg: { type: String, default: '' },     // organisation / chapter / role
  notes: { type: String, default: '' },            // anything else for the designer

  // ── Event basics ──
  category: { type: String, default: 'Training' }, // Training | Webinar
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '' },

  // ── Schedule ──
  dateStart: { type: String, default: '' },        // YYYY-MM-DD
  dateEnd: { type: String, default: '' },          // YYYY-MM-DD
  time: { type: String, default: '' },
  timeZone: { type: String, default: 'WAT' },

  // ── CPD ──
  cpdPoints: { type: Number, default: 0 },

  // ── Venue / platform ──
  venueType: { type: String, default: 'Hybrid' },  // In-Person | Virtual | Hybrid
  venuePhysical: { type: String, default: '' },
  venueCity: { type: String, default: '' },
  platform: { type: String, default: 'Zoom' },
  platformNote: { type: String, default: '' },

  // ── Training module breakdown (one per line) ──
  schedule: { type: String, default: '' },

  // ── Registration ──
  registrationUrl: { type: String, default: '' },
  registrationExtra: { type: String, default: '' },

  // ── Enquiries + speakers ──
  enquiries: { type: [String], default: [] },
  speakers: { type: [requestSpeakerSchema], default: [] },

  // ── Routing / scope (resolved from the link token the admin shared) ──
  scope: { type: String, enum: ['national', 'chapter'], default: 'national' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', default: null },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }, // admin who shared the link

  // ── Workflow ──
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'archived'],
    default: 'pending',
  },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  createdEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }, // the flyer/event built from this
}, { timestamps: true });

flyerRequestSchema.index({ status: 1, chapter: 1, createdAt: -1 });

module.exports = mongoose.model('FlyerRequest', flyerRequestSchema);
