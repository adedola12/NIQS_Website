const QSFirm = require('../models/QSFirm');
const portal = require('../utils/portalClient');

/* ── Public: list / search ──
   Who owns the firm directory is still open (PORTAL_INTEGRATION_SPEC.md §9): the
   website holds it today, the portal may take it. Rather than wait for that
   decision, this asks the portal first whenever it is configured and falls back
   to the website's own records otherwise — so whichever way it lands, the client
   contract and the page above it are unchanged. */
exports.getAllFirms = async (req, res) => {
  try {
    const { search = '', state = '', page = 1, limit = 24 } = req.query;

    if (portal.isConfigured()) {
      const r = await portal.searchFirms({ q: search, state, page: Number(page), pageSize: Number(limit) });
      // Only defer to the portal when it actually has the directory. An empty
      // result from a portal that does not own firms must not blank a page the
      // website can still serve from its own records.
      if (Array.isArray(r.results) && r.results.length) {
        return res.json({
          firms: r.results,
          total: r.total ?? r.results.length,
          page: r.page ?? Number(page),
          pages: Math.ceil((r.total ?? r.results.length) / (r.pageSize || limit)),
          source: 'portal',
        });
      }
    }

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
    res.json({ firms, total, page: Number(page), pages: Math.ceil(total / limit), source: 'website' });
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
