const PastPresident = require('../models/PastPresident');

// ── Public ──────────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const list = await PastPresident.find({ isActive: true }).sort('order');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Admin ────────────────────────────────────────────────────────────────────
exports.getAdminAll = async (req, res) => {
  try {
    const list = await PastPresident.find().sort('order');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const doc = await PastPresident.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await PastPresident.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    Object.assign(doc, req.body);
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await PastPresident.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
