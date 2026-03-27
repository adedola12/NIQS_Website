const router = require('express').Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, getAdminEvents } = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');
const { chapterScope, deleteCheck } = require('../middleware/roleCheck');

router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.get('/admin/all', protect, adminOnly, getAdminEvents);
router.post('/', protect, adminOnly, chapterScope, createEvent);
router.put('/:id', protect, adminOnly, chapterScope, updateEvent);
router.delete('/:id', protect, adminOnly, deleteCheck, deleteEvent);

module.exports = router;
