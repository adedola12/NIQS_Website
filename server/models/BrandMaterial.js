const mongoose = require('mongoose');

const brandMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  buttonLabel: { type: String, default: 'Download' },
  fileUrl: { type: String, default: '' },

  /* Preview block configuration */
  previewType: {
    type: String,
    enum: ['image', 'gradient', 'image_contained'],
    default: 'image'
  },
  // For previewType === 'image' or 'image_contained': URL shown in the preview box
  previewImage: { type: String, default: '' },
  // Inline CSS background string for 'gradient' type
  // e.g. "linear-gradient(135deg,#0B1F4B 50%,#C9974A 100%)"
  previewBackground: { type: String, default: '' },
  // Extra CSS filter/style on the contained logo image
  imageFilter: { type: String, default: '' },

  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('BrandMaterial', brandMaterialSchema);
