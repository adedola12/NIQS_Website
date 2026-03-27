const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registrationNumber: { type: String, unique: true, sparse: true },
  membershipType: {
    type: String,
    enum: ['probationer', 'graduate', 'corporate', 'fellow', 'student', 'technician'],
    required: true
  },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female'] },
  qualification: { type: String },
  employer: { type: String },
  designation: { type: String },
  address: { type: String },
  status: { type: String, enum: ['pending', 'active', 'suspended', 'expired'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'overdue'], default: 'unpaid' },
  yearJoined: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
