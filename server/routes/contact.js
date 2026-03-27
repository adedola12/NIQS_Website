const router = require('express').Router();
const { submitContact, getAllContacts, markAsRead, deleteContact } = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/auth');
const { deleteCheck } = require('../middleware/roleCheck');

// Public
router.post('/', submitContact);

// Admin
router.get('/', protect, adminOnly, getAllContacts);
router.put('/:id/read', protect, adminOnly, markAsRead);
router.delete('/:id', protect, adminOnly, deleteCheck, deleteContact);

module.exports = router;
