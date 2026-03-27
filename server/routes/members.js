const router = require('express').Router();
const { getAllMembers, getMemberById, updateMember, getMyProfile } = require('../controllers/memberController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// Member portal route
router.get('/me', protect, getMyProfile);

// Admin routes
router.get('/', protect, adminOnly, getAllMembers);
router.get('/:id', protect, adminOnly, getMemberById);
router.put('/:id', protect, adminOnly, roleCheck('main_admin', 'national_admin'), updateMember);

module.exports = router;
