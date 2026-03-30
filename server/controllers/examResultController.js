const ExamResult = require('../models/ExamResult');

/* ── Public: all active results ordered by sortOrder then year desc ── */
exports.getAll = async (req, res) => {
  try {
    const results = await ExamResult.find()
      .sort({ sortOrder: 1, year: -1, createdAt: -1 });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await ExamResult.create({ ...req.body, createdBy: req.admin._id });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await ExamResult.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await ExamResult.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json({ message: 'Result deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
