const QSFirm = require('../models/QSFirm');

/* ── Public: list / search ── */
exports.getAllFirms = async (req, res) => {
  try {
    const { search = '', state = '', page = 1, limit = 24 } = req.query;
    const filter = { isActive: true };

    if (state)  filter.state = state;
    if (search) filter.$or = [
      { name:      { $regex: search, $options: 'i' } },
      { address:   { $regex: search, $options: 'i' } },
      { city:      { $regex: search, $options: 'i' } },
      { regNumber: { $regex: search, $options: 'i' } },
    ];

    const firms = await QSFirm.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await QSFirm.countDocuments(filter);
    res.json({ firms, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ── Admin: list all (incl. inactive) ── */
exports.getAllFirmsAdmin = async (req, res) => {
  try {
    const firms = await QSFirm.find().sort({ name: 1 });
    res.json({ firms, total: firms.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFirmById = async (req, res) => {
  try {
    const firm = await QSFirm.findById(req.params.id);
    if (!firm) return res.status(404).json({ message: 'QS Firm not found' });
    res.json(firm);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createFirm = async (req, res) => {
  try {
    const firm = await QSFirm.create({ ...req.body, createdBy: req.admin._id });
    res.status(201).json(firm);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateFirm = async (req, res) => {
  try {
    const firm = await QSFirm.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!firm) return res.status(404).json({ message: 'QS Firm not found' });
    res.json(firm);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteFirm = async (req, res) => {
  try {
    const firm = await QSFirm.findByIdAndDelete(req.params.id);
    if (!firm) return res.status(404).json({ message: 'QS Firm not found' });
    res.json({ message: 'QS Firm deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
