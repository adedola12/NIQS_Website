const router = require('express').Router();
const { getMembershipStats } = require('../controllers/statsController');

// Public and read-only — it returns the same aggregate counts the Institute
// publishes. No personal data passes through this route.
router.get('/membership', getMembershipStats);

module.exports = router;
