const router = require('express').Router();
const ctrl = require('../controllers/qsController');
const rateLimit = require('../middleware/rateLimit');

/* Public, unauthenticated, and backed by the member register — so it is rate
   limited. Comfortably above what a person typing in a search box produces, low
   enough that walking the directory page by page stops being practical. */
const limiter = rateLimit({ windowMs: 60_000, max: 30 });

router.get('/search', limiter, ctrl.searchRegisteredQS);
router.get('/verify', limiter, ctrl.verifyRegisteredQS);
router.get('/lookup', limiter, ctrl.lookup);

module.exports = router;
