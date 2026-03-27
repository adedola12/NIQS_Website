const Admin = require('../models/Admin');
const Chapter = require('../models/Chapter');

// Get all admins (main_admin only)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate('assignedChapter', 'name state')
      .populate('createdBy', 'firstName lastName')
      .sort('-createdAt');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create admin (main_admin only — UAC)
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role, assignedChapter } = req.body;

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered as admin' });
    }

    if (role === 'state_admin' && !assignedChapter) {
      return res.status(400).json({ message: 'State admin must have an assigned chapter' });
    }

    if (assignedChapter) {
      const chapter = await Chapter.findById(assignedChapter);
      if (!chapter) {
        return res.status(400).json({ message: 'Invalid chapter ID' });
      }
    }

    const admin = await Admin.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      assignedChapter: role === 'state_admin' ? assignedChapter : null,
      createdBy: req.admin._id
    });

    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update admin (main_admin only)
exports.updateAdmin = async (req, res) => {
  try {
    const { firstName, lastName, phone, role, assignedChapter, isActive } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deactivating yourself
    if (req.admin._id.toString() === req.params.id && isActive === false) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phone) admin.phone = phone;
    if (role) admin.role = role;
    if (typeof isActive === 'boolean') admin.isActive = isActive;
    admin.assignedChapter = role === 'state_admin' ? assignedChapter : null;

    await admin.save();
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete admin (main_admin only)
exports.deleteAdmin = async (req, res) => {
  try {
    if (req.admin._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const News = require('../models/News');
    const Event = require('../models/Event');
    const Member = require('../models/Member');
    const Contact = require('../models/Contact');

    let newsFilter = {};
    let eventFilter = {};
    let memberFilter = {};

    // Scope data based on role
    if (req.admin.role === 'state_admin' && req.admin.assignedChapter) {
      newsFilter = { chapter: req.admin.assignedChapter };
      eventFilter = { chapter: req.admin.assignedChapter };
      memberFilter = { chapter: req.admin.assignedChapter };
    }

    const [newsCount, eventCount, memberCount, contactCount, adminCount] = await Promise.all([
      News.countDocuments(newsFilter),
      Event.countDocuments(eventFilter),
      Member.countDocuments(memberFilter),
      Contact.countDocuments({ isRead: false }),
      Admin.countDocuments()
    ]);

    const recentNews = await News.find(newsFilter).sort('-createdAt').limit(5).populate('author', 'firstName lastName');
    const upcomingEvents = await Event.find({ ...eventFilter, date: { $gte: new Date() } }).sort('date').limit(5);

    res.json({
      stats: { newsCount, eventCount, memberCount, contactCount, adminCount },
      recentNews,
      upcomingEvents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
