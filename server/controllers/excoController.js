const Exco = require('../models/Exco');

exports.getAllExco = async (req, res) => {
  try {
    const { scope, chapter } = req.query;
    const filter = { isActive: true };
    if (scope) filter.scope = scope;
    if (chapter) filter.chapter = chapter;

    const exco = await Exco.find(filter).populate('chapter', 'name').sort('order');
    res.json(exco);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getExcoById = async (req, res) => {
  try {
    const exco = await Exco.findById(req.params.id).populate('chapter', 'name');
    if (!exco) return res.status(404).json({ message: 'Exco member not found' });
    res.json(exco);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createExco = async (req, res) => {
  try {
    if (req.admin.role === 'state_admin' && req.body.scope === 'national') {
      return res.status(403).json({ message: 'State admins can only add chapter exco members' });
    }
    const exco = await Exco.create(req.body);
    res.status(201).json(exco);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateExco = async (req, res) => {
  try {
    const exco = await Exco.findById(req.params.id);
    if (!exco) return res.status(404).json({ message: 'Exco member not found' });

    if (req.admin.role === 'state_admin') {
      if (!exco.chapter || exco.chapter.toString() !== req.admin.assignedChapter?.toString()) {
        return res.status(403).json({ message: 'You can only edit your chapter\'s exco' });
      }
    }

    Object.assign(exco, req.body);
    await exco.save();
    res.json(exco);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteExco = async (req, res) => {
  try {
    const exco = await Exco.findByIdAndDelete(req.params.id);
    if (!exco) return res.status(404).json({ message: 'Exco member not found' });
    res.json({ message: 'Exco member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
