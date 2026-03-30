const router = require('express').Router();
const ctrl = require('../controllers/workshopMaterialController');
const { protect, adminOnly } = require('../middleware/auth');
const { deleteCheck } = require('../middleware/roleCheck');

router.get('/', ctrl.getAll);

router.get('/admin/all', protect, adminOnly, ctrl.getAllAdmin);
router.post('/',         protect, adminOnly, ctrl.create);
router.put('/:id',       protect, adminOnly, ctrl.update);
router.delete('/:id',    protect, adminOnly, deleteCheck, ctrl.remove);

module.exports = router;
