const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/contactInfoController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',        ctrl.getAll);
router.get('/:type',   ctrl.getOne);
router.put('/:type',   protect, adminOnly, ctrl.update);

module.exports = router;
