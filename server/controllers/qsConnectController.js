const QSConnect = require('../models/QSConnect');

exports.getAll = async (req, res) => {
  try {
    const issues = await QSConnect.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ issues });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const issues = await QSConnect.find().populate('createdBy', 'firstName lastName').sort({ sortOrder: 1, createdAt: -1 });
    res.json({ issues });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    // If new issue is featured, unfeature others
    if (req.body.isFeatured) await QSConnect.updateMany({}, { isFeatured: false });
    const issue = await QSConnect.create({ ...req.body, createdBy: req.admin._id });
    res.status(201).json(issue);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    if (req.body.isFeatured) await QSConnect.updateMany({ _id: { $ne: req.params.id } }, { isFeatured: false });
    const issue = await QSConnect.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!issue) return res.status(404).json({ message: 'Not found' });
    res.json(issue);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const issue = await QSConnect.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
