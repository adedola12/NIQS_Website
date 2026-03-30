const router = require('express').Router();
const { adminLogin, memberLogin, registerMember, getMe, logout, forgotPassword, resetPassword, seedAdmin, seedMember } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/admin/login',    adminLogin);
router.post('/seed-admin',     seedAdmin);      // one-time only — disabled after first admin exists
router.post('/seed-member',    seedMember);     // creates a test member account

// Member auth — primary routes + short aliases (client compatibility)
router.post('/member/login',   memberLogin);
router.post('/login',          memberLogin);    // alias
router.post('/member/register', registerMember);
router.post('/register',       registerMember); // alias

router.get('/me',              protect, getMe);
router.post('/logout',         logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
