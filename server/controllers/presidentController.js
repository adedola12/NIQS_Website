const President = require('../models/President');

/* ── PUBLIC: get president data ── */
exports.getPresident = async (req, res) => {
  try {
    let president = await President.findOne({ _singleton: 'president' });

    // If no record yet, return default values by creating the seed doc
    if (!president) {
      president = await President.create({ _singleton: 'president' });
    }

    res.json(president);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── ADMIN: update president data (upsert) ── */
exports.updatePresident = async (req, res) => {
  try {
    const {
      name, title, tenure, linkedIn,
      photo, backgroundImage,
      paragraph1, paragraph2, quote
    } = req.body;

    const president = await President.findOneAndUpdate(
      { _singleton: 'president' },
      {
        name, title, tenure, linkedIn,
        photo, backgroundImage,
        paragraph1, paragraph2, quote,
        updatedBy: req.admin._id,
      },
      { new: true, upsert: true, runValidators: false }
    );

    res.json(president);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
