const router = require('express').Router();
const { getAllJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck, deleteCheck } = require('../middleware/roleCheck');

router.get('/', getAllJobs);
router.get('/:id', getJobById);

router.post('/', protect, adminOnly, roleCheck('main_admin', 'national_admin'), createJob);
router.put('/:id', protect, adminOnly, roleCheck('main_admin', 'national_admin'), updateJob);
router.delete('/:id', protect, adminOnly, deleteCheck, deleteJob);

module.exports = router;
