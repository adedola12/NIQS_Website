const router = require('express').Router();
const ctrl   = require('../controllers/pastPresidentController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck, deleteCheck } = require('../middleware/roleCheck');

// Public
router.get('/', ctrl.getAll);

// Admin — national/main admin only for writes
router.get('/admin', protect, adminOnly, ctrl.getAdminAll);
router.post('/',     protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.create);
router.put('/:id',  protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.update);
router.delete('/:id', protect, adminOnly, deleteCheck, ctrl.remove);

module.exports = router;
