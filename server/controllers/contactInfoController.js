const ContactInfo = require('../models/ContactInfo');

/* Map role → body key */
const ROLE_BODY = {
  national_admin: 'national',
  waqsn_admin:    'waqsn',
  yqsf_admin:     'yqsf',
};

/* Default labels */
const LABELS = {
  national: 'National Secretariat',
  waqsn:    'WAQSN (Women Assoc. of QS Nigeria)',
  yqsf:     'Young QS Forum (YQSF)',
};

/* GET /api/contact-info  — returns all three records (public) */
exports.getAll = async (req, res) => {
  try {
    const records = await ContactInfo.find({});
    /* Build a keyed object so client can access by type */
    const map = {};
    for (const r of records) map[r._id] = r;
    res.json(map);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* GET /api/contact-info/:type  — returns one record (public) */
exports.getOne = async (req, res) => {
  const { type } = req.params;
  if (!['national', 'waqsn', 'yqsf'].includes(type))
    return res.status(400).json({ message: 'Invalid type' });
  try {
    let doc = await ContactInfo.findById(type);
    if (!doc) doc = { _id: type, label: LABELS[type] };
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* PUT /api/contact-info/:type  — update (admin only, role-gated) */
exports.update = async (req, res) => {
  const { type } = req.params;
  if (!['national', 'waqsn', 'yqsf'].includes(type))
    return res.status(400).json({ message: 'Invalid type' });

  const role = req.admin?.role;
  /* main_admin can edit any; others can only edit their own body */
  if (role !== 'main_admin') {
    const allowed = ROLE_BODY[role];
    if (allowed !== type)
      return res.status(403).json({ message: 'You can only edit your own body\'s contact info' });
  }

  try {
    const doc = await ContactInfo.findByIdAndUpdate(
      type,
      { $set: { ...req.body, _id: type, label: req.body.label || LABELS[type] } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
