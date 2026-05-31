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
const { protect, adminOnly } = require('../middleware/auth');
const { chapterScope, deleteCheck } = require('../middleware/roleCheck');

// Public
router.get('/', getAllEvents);

// Admin calendar + guardrail — must precede '/:id' so they aren't captured by it
router.get('/calendar', protect, adminOnly, getCalendarEvents);
router.get('/check-date', protect, adminOnly, checkDate);
router.get('/admin/all', protect, adminOnly, getAdminEvents);

router.get('/:id', getEventById);

router.post('/', protect, adminOnly, chapterScope, createEvent);
router.put('/:id', protect, adminOnly, chapterScope, updateEvent);
router.delete('/:id', protect, adminOnly, deleteCheck, deleteEvent);

module.exports = router;
