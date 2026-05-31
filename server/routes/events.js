const router = require('express').Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminEvents,
  getCalendarEvents,
  checkDate,
} = require('../controllers/eventController');
const { getPublicEvent, register, listForEvent } = require('../controllers/registrationController');
const { protect, adminOnly } = require('../middleware/auth');
const { chapterScope, deleteCheck } = require('../middleware/roleCheck');

// Public
router.get('/', getAllEvents);

// Admin calendar + guardrail — must precede '/:id' so they aren't captured by it
router.get('/calendar', protect, adminOnly, getCalendarEvents);
router.get('/check-date', protect, adminOnly, checkDate);
router.get('/admin/all', protect, adminOnly, getAdminEvents);

router.get('/:id', getEventById);

// Public registration (QR / "Register now")
router.get('/:id/public', getPublicEvent);
router.post('/:id/register', register);
// Admin: registrants for an event
router.get('/:id/registrations', protect, adminOnly, listForEvent);

router.post('/', protect, adminOnly, chapterScope, createEvent);
router.put('/:id', protect, adminOnly, chapterScope, updateEvent);
router.delete('/:id', protect, adminOnly, deleteCheck, deleteEvent);

module.exports = router;
