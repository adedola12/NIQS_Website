const Journal = require('../models/Journal');

exports.getAll = async (req, res) => {
  try {
    const journals = await Journal.find({ isPublished: true }).sort({ sortOrder: 1, year: -1, volume: -1, issue: -1 });
    res.json({ journals });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const journals = await Journal.find().populate('createdBy', 'firstName lastName').sort({ sortOrder: 1, year: -1 });
    res.json({ journals });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const journal = await Journal.create({ ...req.body, createdBy: req.admin._id });
    res.status(201).json(journal);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const journal = await Journal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!journal) return res.status(404).json({ message: 'Not found' });
    res.json(journal);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const journal = await Journal.findByIdAndDelete(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
