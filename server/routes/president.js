const router = require('express').Router();
const { getPresident, updatePresident } = require('../controllers/presidentController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.get('/', getPresident);

// Admin (main_admin or national_admin only)
router.put('/', protect, adminOnly, updatePresident);

module.exports = router;
