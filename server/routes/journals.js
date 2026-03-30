const router = require('express').Router();
const ctrl = require('../controllers/journalController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck, deleteCheck } = require('../middleware/roleCheck');

router.get('/', ctrl.getAll);

router.get('/admin/all', protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.getAllAdmin);
router.post('/',         protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.create);
router.put('/:id',       protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.update);
router.delete('/:id',    protect, adminOnly, deleteCheck, ctrl.remove);

module.exports = router;
