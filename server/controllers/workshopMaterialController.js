const WorkshopMaterial = require('../models/WorkshopMaterial');

exports.getAll = async (req, res) => {
  try {
    const { scope, type } = req.query;
    const filter = { isPublished: true };
    if (scope) filter.scope = scope;
    if (type)  filter.type  = type;
    const materials = await WorkshopMaterial.find(filter).populate('chapter', 'name').sort({ createdAt: -1 });
    res.json({ materials });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const admin = req.admin;
    const filter = {};
    if (admin.role === 'state_admin') filter.chapter = admin.chapter;
    if (admin.role === 'yqsf_admin')  filter.scope   = 'yqsf';
    if (admin.role === 'waqsn_admin') filter.scope   = 'waqsn';
    const materials = await WorkshopMaterial.find(filter).populate('chapter', 'name').populate('createdBy', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ materials });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const admin = req.admin;
    const body  = { ...req.body, createdBy: admin._id };
    if (admin.role === 'state_admin') { body.scope = 'chapter'; body.chapter = admin.chapter; }
    if (admin.role === 'yqsf_admin')  { body.scope = 'yqsf'; }
    if (admin.role === 'waqsn_admin') { body.scope = 'waqsn'; }
    const material = await WorkshopMaterial.create(body);
    res.status(201).json(material);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const material = await WorkshopMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!material) return res.status(404).json({ message: 'Not found' });
    res.json(material);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const material = await WorkshopMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
