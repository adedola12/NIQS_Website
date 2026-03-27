const Event = require('../models/Event');

exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 12, type, scope, chapter, upcoming } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (scope) filter.scope = scope;
    if (chapter) filter.chapter = chapter;
    if (upcoming === 'true') filter.date = { $gte: new Date() };

    const events = await Event.find(filter)
      .populate('chapter', 'name')
      .populate('author', 'firstName lastName')
      .sort(upcoming === 'true' ? 'date' : '-date')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('chapter', 'name')
      .populate('author', 'firstName lastName');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    if (req.admin.role === 'state_admin' && req.body.scope === 'national') {
      return res.status(403).json({ message: 'State admins can only create chapter events' });
    }

    const event = await Event.create({ ...req.body, author: req.admin._id });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (req.admin.role === 'state_admin') {
      if (!event.chapter || event.chapter.toString() !== req.admin.assignedChapter?.toString()) {
        return res.status(403).json({ message: 'You can only edit your chapter\'s events' });
      }
    }

    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAdminEvents = async (req, res) => {
  try {
    let filter = {};
    if (req.admin.role === 'state_admin' && req.admin.assignedChapter) {
      filter.chapter = req.admin.assignedChapter;
    }

    const events = await Event.find(filter)
      .populate('author', 'firstName lastName')
      .populate('chapter', 'name')
      .sort('-createdAt');

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
