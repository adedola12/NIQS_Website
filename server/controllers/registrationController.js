const crypto = require('crypto');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { dayStartUTC, dayEndUTC } = require('../utils/eventConflicts');
const { sendMail, registrationEmailHtml, publicBase } = require('../utils/email');
const portal = require('../utils/portalClient');

const ATTEND_GRACE_DAYS = 5; // attendance link stays active this many days after the end date

/* ── Helpers ───────────────────────────────────────────────────────────────── */

// Verify a member against the NIQS portal (portal.niqsng.org). Returns the portal
// member object, or null. No-ops (null) until PORTAL_API_URL + PORTAL_API_KEY are set.
// See docs/PORTAL_INTEGRATION_SPEC.md §4.1.
async function lookupMember(membershipNumber) {
  if (!membershipNumber) return null;
  try {
    return await portal.verifyMember({ membershipNumber });
  } catch {
    return null;
  }
}

function cpdOf(event) {
  return (event.flyer && event.flyer.cpdPoints) || 0;
}

// Can this admin see/manage registrations for this event?
function canManageEvent(admin, event) {
  if (!admin) return false;
  if (admin.role === 'main_admin' || admin.role === 'national_admin') return true;
  if (admin.role === 'state_admin') {
    return !!event.chapter && !!admin.assignedChapter &&
      event.chapter.toString() === admin.assignedChapter.toString();
  }
  // waqsn / yqsf sub-admins → only events they authored
  return event.author && event.author.toString() === admin._id.toString();
}

// Build absolute links to the client pages (prefers PUBLIC_URL/CLIENT_URL, else the request Origin).
function clientBase(req) {
  return publicBase() || req.get('origin') || `${req.protocol}://${req.get('host')}`;
}

/* ── Public ────────────────────────────────────────────────────────────────── */

exports.getPublicEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('chapter', 'name').lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const f = event.flyer || {};
    res.json({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      endDate: event.endDate,
      location: event.location,
      venue: event.venue,
      type: event.type,
      scope: event.scope,
      chapterName: event.chapter?.name || null,
      cpdPoints: f.cpdPoints || 0,
      category: f.category || null,
      venueType: f.venueType || null,
      time: f.time || null,
      platform: f.platform || null,
      registrationExtra: f.registrationExtra || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { isMember, membershipNumber, username, fullName, email, phone, address } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Full name and email are required' });
    }
    if (isMember && !membershipNumber) {
      return res.status(400).json({ message: 'Membership number is required for members' });
    }

    // Participation mode follows the event format; only Hybrid lets the user choose.
    const vt = event.flyer?.venueType;
    let participationMode;
    if (vt === 'In-Person') participationMode = 'in-person';
    else if (vt === 'Virtual') participationMode = 'virtual';
    else participationMode = req.body.participationMode === 'virtual' ? 'virtual' : 'in-person';

    // Verify against the NIQS portal (no-op → false until PORTAL_API_* configured)
    let memberVerified = false;
    if (isMember && membershipNumber) {
      const portalMember = await lookupMember(membershipNumber);
      memberVerified = !!portalMember;
    }

    const emailLc = String(email).toLowerCase().trim();
    let reg = await Registration.findOne({ event: event._id, email: emailLc });

    if (reg) {
      Object.assign(reg, {
        isMember: !!isMember,
        membershipNumber: membershipNumber || '',
        memberVerified,
        username: username || reg.username || '',
        fullName,
        phone: phone || '',
        address: address || '',
        participationMode,
      });
      if (!reg.attendanceToken) reg.attendanceToken = crypto.randomBytes(24).toString('hex');
      await reg.save();
    } else {
      reg = await Registration.create({
        event: event._id,
        isMember: !!isMember,
        membershipNumber: membershipNumber || '',
        memberVerified,
        username: username || '',
        fullName,
        email: emailLc,
        phone: phone || '',
        address: address || '',
        participationMode,
        attendanceToken: crypto.randomBytes(24).toString('hex'),
      });
    }

    const base = clientBase(req);
    const eventLink = `${base}/events/${event._id}/register`;
    const attendanceLink = `${base}/events/attend/${reg.attendanceToken}`;

    const mail = await sendMail({
      to: reg.email,
      subject: `You're registered: ${event.title}`,
      html: registrationEmailHtml(reg, event, { eventLink, attendanceLink }),
      text: `Hi ${reg.fullName}, you're registered for "${event.title}". When you attend, open this link to claim your CPD points: ${attendanceLink}`,
    });

    res.status(201).json({
      message: 'Registration successful',
      registration: { id: reg._id, fullName: reg.fullName, email: reg.email, participationMode: reg.participationMode },
      eventLink,
      attendanceLink,
      cpdPoints: cpdOf(event),
      emailSent: mail.sent,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered for this event' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.attend = async (req, res) => {
  try {
    const reg = await Registration.findOne({ attendanceToken: req.params.token }).populate('event');
    if (!reg || !reg.event) return res.status(404).json({ status: 'invalid', message: 'Invalid or expired attendance link' });

    const event = reg.event;
    const now = new Date();
    const start = dayStartUTC(event.date);
    const end = new Date(dayEndUTC(event.endDate || event.date).getTime() + ATTEND_GRACE_DAYS * 86400000);
    const cpd = cpdOf(event);

    if (reg.attended) {
      return res.json({ status: 'recorded', alreadyRecorded: true, eventTitle: event.title, fullName: reg.fullName, cpdPoints: reg.cpdPoints });
    }
    if (now < start) {
      return res.json({ status: 'too-early', eventTitle: event.title, fullName: reg.fullName, startsOn: event.date, cpdPoints: cpd, message: "This event hasn't started yet." });
    }
    if (now > end) {
      return res.json({ status: 'closed', eventTitle: event.title, fullName: reg.fullName, message: 'The attendance window for this event has closed.' });
    }

    reg.attended = true;
    reg.attendedAt = now;
    reg.cpdPoints = cpd;
    reg.status = 'attended';
    await reg.save();

    res.json({ status: 'recorded', alreadyRecorded: false, eventTitle: event.title, fullName: reg.fullName, cpdPoints: reg.cpdPoints });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error', error: err.message });
  }
};

/* ── Admin ─────────────────────────────────────────────────────────────────── */

exports.listForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('chapter', 'name');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!canManageEvent(req.admin, event)) {
      return res.status(403).json({ message: 'You cannot view registrations for this event' });
    }
    const registrations = await Registration.find({ event: event._id }).sort('-createdAt').lean();
    res.json({
      event: { _id: event._id, title: event.title, date: event.date, endDate: event.endDate, scope: event.scope, chapterName: event.chapter?.name || null, cpdPoints: cpdOf(event) },
      registrations,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.setAttendance = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('event');
    if (!reg || !reg.event) return res.status(404).json({ message: 'Registration not found' });
    if (!canManageEvent(req.admin, reg.event)) {
      return res.status(403).json({ message: 'You cannot manage this registration' });
    }

    const attended = !!req.body.attended;
    reg.attended = attended;
    reg.attendedAt = attended ? new Date() : null;
    reg.cpdPoints = attended ? cpdOf(reg.event) : 0;
    reg.status = attended ? 'attended' : 'registered';
    await reg.save();

    res.json({ message: 'Attendance updated', registration: { id: reg._id, attended: reg.attended, cpdPoints: reg.cpdPoints } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.lookupMember = lookupMember;
