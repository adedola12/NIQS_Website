const router = require('express').Router();
const ctrl = require('../controllers/qsFirmController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck, deleteCheck } = require('../middleware/roleCheck');

/* Public */
router.get('/', ctrl.getAllFirms);
router.get('/:id', ctrl.getFirmById);

/* Admin — only national_admin and main_admin can manage QS firms */
router.get('/admin/all', protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.getAllFirmsAdmin);
router.post('/',         protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.createFirm);
router.put('/:id',       protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.updateFirm);
router.delete('/:id',    protect, adminOnly, deleteCheck, ctrl.deleteFirm);

module.exports = router;
