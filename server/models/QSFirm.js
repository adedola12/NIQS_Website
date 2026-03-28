const mongoose = require('mongoose');

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const qsFirmSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  logo:        { type: String, trim: true, default: '' },          // image URL
  regNumber:   { type: String, trim: true, default: '' },          // QSRBN reg number
  address:     { type: String, required: true, trim: true },
  city:        { type: String, trim: true, default: '' },
  state:       { type: String, required: true, enum: NIGERIAN_STATES },
  phone:       { type: String, trim: true, default: '' },
  email:       { type: String, trim: true, default: '' },
  website:     { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

/* Text index for search */
qsFirmSchema.index({ name: 'text', address: 'text', city: 'text', regNumber: 'text' });

module.exports = mongoose.model('QSFirm', qsFirmSchema);
module.exports.NIGERIAN_STATES = NIGERIAN_STATES;
