const router = require('express').Router();
const ctrl = require('../controllers/brandMaterialController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.get('/', ctrl.getAll);

// Admin only
router.get('/admin/all', protect, adminOnly, ctrl.getAdminAll);
router.post('/', protect, adminOnly, ctrl.create);
router.put('/:id', protect, adminOnly, ctrl.update);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
