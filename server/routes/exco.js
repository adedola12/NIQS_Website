const router = require('express').Router();
const { getAllExco, getExcoById, createExco, updateExco, deleteExco } = require('../controllers/excoController');
const { protect, adminOnly } = require('../middleware/auth');
const { chapterScope, deleteCheck } = require('../middleware/roleCheck');

router.get('/', getAllExco);
router.get('/:id', getExcoById);

router.post('/', protect, adminOnly, chapterScope, createExco);
router.put('/:id', protect, adminOnly, chapterScope, updateExco);
router.delete('/:id', protect, adminOnly, deleteCheck, deleteExco);

module.exports = router;
