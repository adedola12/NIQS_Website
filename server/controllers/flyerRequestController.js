const jwt = require('jsonwebtoken');
const FlyerRequest = require('../models/FlyerRequest');
const Chapter = require('../models/Chapter');
const { sendMail, flyerRequestEmailHtml } = require('../utils/email');

const LINK_PURPOSE = 'flyer_intake';

// Mirrors client/src/flyer/categories.js — keep in sync.
const FLYER_CATEGORIES = ['Training', 'Webinar', 'Courtesy Visit', 'Appreciation', 'Congratulations', 'Condolence'];

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function isHQ(role) {
  return role === 'main_admin' || role === 'national_admin';
}

// Can this admin see / handle this request?
function canManageRequest(admin, reqDoc) {
  if (!admin) return false;
  if (isHQ(admin.role)) return true;
  if (admin.role === 'state_admin') {
    return !!reqDoc.chapter && !!admin.assignedChapter &&
      String(reqDoc.chapter._id || reqDoc.chapter) === String(admin.assignedChapter);
  }
  // waqsn / yqsf sub-admins → only requests generated from their own shared link
  return reqDoc.requestedBy &&
    String(reqDoc.requestedBy._id || reqDoc.requestedBy) === String(admin._id);
}

// Mongo filter limiting a list to what this admin may see (mirrors getAdminEvents).
function scopeFilter(admin) {
  if (isHQ(admin.role)) return {};
  if (admin.role === 'state_admin') return { chapter: admin.assignedChapter || null };
  return { requestedBy: admin._id };
}

/* ── Admin: generate a shareable intake link ───────────────────────────────── */
// Returns a signed token; the client builds the full /flyer-request/<token> URL.
exports.generateLink = async (req, res) => {
  try {
    let scope = req.body.scope || (isHQ(req.admin.role) ? 'national' : 'chapter');
    let chapter = scope === 'chapter'
      ? (req.body.chapter || req.admin.assignedChapter || null)
      : null;

    // Non-HQ admins are always bound to their own scope.
    if (!isHQ(req.admin.role)) {
      scope = 'chapter';
      chapter = req.admin.assignedChapter || null; // waqsn/yqsf: null, routed by `by`
    }

    const token = jwt.sign(
      {
        purpose: LINK_PURPOSE,
        scope,
        chapter: chapter ? String(chapter) : null,
        by: String(req.admin._id),
      },
      process.env.JWT_SECRET,
      { expiresIn: '180d' },
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── Public: resolve a link token for display on the form ──────────────────── */
exports.getLinkContext = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    if (decoded.purpose !== LINK_PURPOSE) throw new Error('bad purpose');

    let chapterName = null;
    if (decoded.chapter) {
      const ch = await Chapter.findById(decoded.chapter).select('name').lean();
      chapterName = ch?.name || null;
    }
    res.json({ valid: true, scope: decoded.scope || 'national', chapterName });
  } catch (_) {
    // Invalid/expired token → the form still works as a generic submission.
    res.json({ valid: false });
  }
};

/* ── Public: submit an intake request ──────────────────────────────────────── */
exports.createRequest = async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.requesterName || !b.requesterEmail || !b.title) {
      return res.status(400).json({ message: 'Your name, email, and the event title are required.' });
    }

    // Resolve routing from the link token, if one was used.
    let scope = 'national', chapter = null, requestedBy = null;
    if (b.token) {
      try {
        const d = jwt.verify(b.token, process.env.JWT_SECRET);
        if (d.purpose === LINK_PURPOSE) {
          scope = d.scope || 'national';
          chapter = d.chapter || null;
          requestedBy = d.by || null;
        }
      } catch (_) { /* invalid token → generic request */ }
    }

    const speakers = Array.isArray(b.speakers)
      ? b.speakers
          .filter((s) => s && (s.name || s.topic))
          .slice(0, 5)
          .map((s) => ({
            name: s.name || '',
            credentials: s.credentials || '',
            role: s.role || 'Faculty',
            topic: s.topic || '',
          }))
      : [];

    const enquiries = Array.isArray(b.enquiries)
      ? b.enquiries.map((e) => String(e || '').trim()).filter(Boolean).slice(0, 5)
      : [];

    const doc = await FlyerRequest.create({
      requesterName: b.requesterName,
      requesterEmail: b.requesterEmail,
      requesterPhone: b.requesterPhone || '',
      requesterOrg: b.requesterOrg || '',
      notes: b.notes || '',
      category: FLYER_CATEGORIES.includes(b.category) ? b.category : 'Training',
      title: b.title,
      subtitle: b.subtitle || '',
      host: b.host || '',
      message: b.message || '',
      dateStart: b.dateStart || '',
      dateEnd: b.dateEnd || '',
      time: b.time || '',
      timeZone: b.timeZone || 'WAT',
      cpdPoints: Number(b.cpdPoints) || 0,
      venueType: b.venueType || 'Hybrid',
      venuePhysical: b.venuePhysical || '',
      venueCity: b.venueCity || '',
      platform: b.platform || 'Zoom',
      platformNote: b.platformNote || '',
      schedule: b.schedule || '',
      registrationUrl: b.registrationUrl || '',
      registrationExtra: b.registrationExtra || '',
      enquiries,
      speakers,
      scope,
      chapter,
      requestedBy,
    });

    // Confirmation to the requester (no-op if SMTP isn't configured).
    const mail = await sendMail({
      to: doc.requesterEmail,
      subject: `We received your flyer request: ${doc.title}`,
      html: flyerRequestEmailHtml(doc),
      text: `Hi ${doc.requesterName}, thanks — NIQS has received your flyer request for "${doc.title}". Our team will design the flyer and follow up shortly.`,
    });

    res.status(201).json({ message: 'Request submitted', id: doc._id, emailSent: mail.sent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── Admin: list requests (role-scoped) ────────────────────────────────────── */
exports.listRequests = async (req, res) => {
  try {
    const filter = scopeFilter(req.admin);
    if (req.query.status) filter.status = req.query.status;
    else filter.status = { $ne: 'archived' };

    const requests = await FlyerRequest.find(filter)
      .populate('chapter', 'name')
      .populate('requestedBy', 'firstName lastName')
      .populate('handledBy', 'firstName lastName')
      .populate('createdEvent', 'title')
      .sort('-createdAt')
      .lean();

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── Admin: get one request (for auto-fill) ────────────────────────────────── */
exports.getRequest = async (req, res) => {
  try {
    const doc = await FlyerRequest.findById(req.params.id).populate('chapter', 'name').lean();
    if (!doc) return res.status(404).json({ message: 'Request not found' });
    if (!canManageRequest(req.admin, doc)) {
      return res.status(403).json({ message: 'You cannot view this request' });
    }
    res.json({ request: doc });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── Admin: update status (in_progress / completed / archived) ─────────────── */
exports.updateStatus = async (req, res) => {
  try {
    const doc = await FlyerRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Request not found' });
    if (!canManageRequest(req.admin, doc)) {
      return res.status(403).json({ message: 'You cannot manage this request' });
    }

    const { status, createdEvent } = req.body;
    const allowed = ['pending', 'in_progress', 'completed', 'archived'];
    if (status && allowed.includes(status)) doc.status = status;
    if (createdEvent) doc.createdEvent = createdEvent;
    if (status === 'in_progress' || status === 'completed') doc.handledBy = req.admin._id;

    await doc.save();
    res.json({ message: 'Updated', request: doc });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/* ── Admin: delete ─────────────────────────────────────────────────────────── */
exports.deleteRequest = async (req, res) => {
  try {
    const doc = await FlyerRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Request not found' });
    if (!canManageRequest(req.admin, doc)) {
      return res.status(403).json({ message: 'You cannot delete this request' });
    }
    await doc.deleteOne();
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
