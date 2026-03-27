const BrandMaterial = require('../models/BrandMaterial');

/* ── PUBLIC: list all published materials ── */
exports.getAll = async (req, res) => {
  try {
    const materials = await BrandMaterial.find({ isPublished: true }).sort('order title');
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── ADMIN: list all (including unpublished) ── */
exports.getAdminAll = async (req, res) => {
  try {
    const materials = await BrandMaterial.find()
      .populate('createdBy', 'firstName lastName')
      .sort('order title');
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── ADMIN: create ── */
exports.create = async (req, res) => {
  try {
    const {
      title, description, buttonLabel, fileUrl,
      previewType, previewImage, previewBackground, imageFilter, order, isPublished
    } = req.body;

    const material = await BrandMaterial.create({
      title, description,
      buttonLabel: buttonLabel || 'Download',
      fileUrl: fileUrl || '',
      previewType: previewType || 'image',
      previewImage: previewImage || '',
      previewBackground: previewBackground || '',
      imageFilter: imageFilter || '',
      order: order || 0,
      isPublished: isPublished !== false,
      createdBy: req.admin._id,
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── ADMIN: update ── */
exports.update = async (req, res) => {
  try {
    const material = await BrandMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Not found' });

    Object.assign(material, req.body);
    await material.save();
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── ADMIN: delete ── */
exports.remove = async (req, res) => {
  try {
    const material = await BrandMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
