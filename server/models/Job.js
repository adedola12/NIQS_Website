const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'remote'], default: 'full-time' },
  description: { type: String, required: true },
  requirements: { type: String },
  salary: { type: String },
  logo: { type: String },
  applicationLink: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  isActive: { type: Boolean, default: true },
  deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
