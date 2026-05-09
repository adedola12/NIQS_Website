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
    /* Strip partnerAd from the general update path — it has its own
       main_admin-gated endpoint and must not be writable by national_admin. */
    const { partnerAd, ...rest } = req.body || {};
    const settings = await SiteSettings.findByIdAndUpdate(
      'global',
      { $set: rest },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* PUT /api/site-settings/partner-ad — main_admin only */
exports.updatePartnerAd = async (req, res) => {
  try {
    const { enabled, tiers, rotationMs, dismissible, label } = req.body || {};
    const update = {};
    if (enabled !== undefined)     update['partnerAd.enabled']     = !!enabled;
    if (Array.isArray(tiers))      update['partnerAd.tiers']       = tiers;
    if (rotationMs !== undefined)  update['partnerAd.rotationMs']  = Math.max(5000, Number(rotationMs) || 25000);
    if (dismissible !== undefined) update['partnerAd.dismissible'] = !!dismissible;
    if (label !== undefined)       update['partnerAd.label']       = String(label).slice(0, 60);

    const settings = await SiteSettings.findByIdAndUpdate(
      'global',
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
