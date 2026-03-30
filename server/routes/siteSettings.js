const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/siteSettingsController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/',    ctrl.getSettings);
router.put('/',    protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.updateSettings);

module.exports = router;
