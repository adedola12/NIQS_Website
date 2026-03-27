const router = require('express').Router();
const { getAllAdmins, createAdmin, updateAdmin, deleteAdmin, getDashboardStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// All routes require admin auth
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/', roleCheck('main_admin'), getAllAdmins);
router.post('/', roleCheck('main_admin'), createAdmin);
router.put('/:id', roleCheck('main_admin'), updateAdmin);
router.delete('/:id', roleCheck('main_admin'), deleteAdmin);

module.exports = router;
