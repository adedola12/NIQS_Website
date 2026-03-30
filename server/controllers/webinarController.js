const Webinar = require('../models/Webinar');

exports.getAll = async (req, res) => {
  try {
    const { scope, upcoming } = req.query;
    const filter = { isPublished: true };
    if (scope) filter.scope = scope;
    if (upcoming === 'true')  filter.isUpcoming = true;
    if (upcoming === 'false') filter.isUpcoming = false;
    const webinars = await Webinar.find(filter).populate('chapter', 'name').sort({ date: -1 });
    res.json({ webinars });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const admin = req.admin;
    const filter = {};
    // State admin: only their chapter's webinars
    if (admin.role === 'state_admin') filter.chapter = admin.chapter;
    if (admin.role === 'yqsf_admin')  filter.scope   = 'yqsf';
    if (admin.role === 'waqsn_admin') filter.scope   = 'waqsn';
    const webinars = await Webinar.find(filter).populate('chapter', 'name').populate('createdBy', 'firstName lastName').sort({ date: -1 });
    res.json({ webinars });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const admin = req.admin;
    const body  = { ...req.body, createdBy: admin._id };
    // Enforce scope for restricted admins
    if (admin.role === 'state_admin') { body.scope = 'chapter'; body.chapter = admin.chapter; }
    if (admin.role === 'yqsf_admin')  { body.scope = 'yqsf'; }
    if (admin.role === 'waqsn_admin') { body.scope = 'waqsn'; }
    const webinar = await Webinar.create(body);
    res.status(201).json(webinar);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const webinar = await Webinar.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!webinar) return res.status(404).json({ message: 'Not found' });
    res.json(webinar);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const webinar = await Webinar.findByIdAndDelete(req.params.id);
    if (!webinar) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
