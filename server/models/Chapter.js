const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true },
  state: { type: String, required: true },
  chairperson: { type: String },
  secretary: { type: String },
  address: { type: String },
  email: { type: String, trim: true },
  phone: { type: String },
  about: { type: String },
  image: { type: String },
  memberCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

chapterSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Chapter', chapterSchema);
