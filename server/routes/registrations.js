const router = require('express').Router();
const { attend, setAttendance } = require('../controllers/registrationController');
const { protect, adminOnly } = require('../middleware/auth');

// Public — self-claim attendance link from the confirmation email
router.get('/attend/:token', attend);

// Admin — override a registrant's attendance (and CPD)
router.patch('/:id/attendance', protect, adminOnly, setAttendance);

module.exports = router;
