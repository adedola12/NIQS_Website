const SiteSettings = require('../models/SiteSettings');

/* GET /api/site-settings — public, returns the singleton */
exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findById('global');
    if (!settings) {
      settings = await SiteSettings.create({ _id: 'global' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* PUT /api/site-settings — national_admin / main_admin only */
exports.updateSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findByIdAndUpdate(
      'global',
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
