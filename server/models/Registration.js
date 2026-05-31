const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },

  // Member vs non-member
  isMember: { type: Boolean, default: false },
  membershipNumber: { type: String, trim: true, default: '' },
  memberVerified: { type: Boolean, default: false }, // true once verified against the NIQS portal (future)
  username: { type: String, trim: true, default: '' }, // from portal (future)

  // Registrant details
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  participationMode: { type: String, enum: ['in-person', 'virtual'], default: 'in-person' },

  // Attendance + CPD
  attended: { type: Boolean, default: false },
  attendedAt: { type: Date },
  cpdPoints: { type: Number, default: 0 }, // banked on attendance, kept for future use
  attendanceToken: { type: String, index: true }, // unique self-claim link token

  status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
}, { timestamps: true });

// One registration per email per event (re-submitting updates the existing row)
registrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
