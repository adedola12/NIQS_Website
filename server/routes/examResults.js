const router  = require('express').Router();
const ctrl     = require('../controllers/examResultController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck, deleteCheck } = require('../middleware/roleCheck');

/* Public */
router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getById);

/* National + Main admin only */
router.post('/',    protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.create);
router.put('/:id',  protect, adminOnly, roleCheck('main_admin', 'national_admin'), ctrl.update);
router.delete('/:id', protect, adminOnly, deleteCheck, ctrl.remove);

module.exports = router;
