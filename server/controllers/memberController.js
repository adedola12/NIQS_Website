const Member = require('../models/Member');
const User = require('../models/User');

exports.getAllMembers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, chapter, membershipType } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (membershipType) filter.membershipType = membershipType;
    if (chapter) filter.chapter = chapter;

    // State admin can only view their chapter's members
    if (req.admin.role === 'state_admin' && req.admin.assignedChapter) {
      filter.chapter = req.admin.assignedChapter;
    }

    const members = await Member.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('chapter', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Member.countDocuments(filter);
    res.json({ members, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('chapter', 'name state');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get member profile (for portal)
exports.getMyProfile = async (req, res) => {
  try {
    const member = await Member.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email phone avatar membershipType')
      .populate('chapter', 'name state');

    if (!member) {
      return res.json({ user: req.user, member: null });
    }
    res.json({ user: req.user, member });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
