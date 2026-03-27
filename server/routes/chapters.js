const router = require('express').Router();
const { getAllChapters, getChapterBySlug, createChapter, updateChapter, deleteChapter } = require('../controllers/chapterController');
const { protect, adminOnly } = require('../middleware/auth');
const { roleCheck, deleteCheck } = require('../middleware/roleCheck');

router.get('/', getAllChapters);
router.get('/:slug', getChapterBySlug);

router.post('/', protect, adminOnly, roleCheck('main_admin', 'national_admin'), createChapter);
router.put('/:id', protect, adminOnly, roleCheck('main_admin', 'national_admin'), updateChapter);
router.delete('/:id', protect, adminOnly, deleteCheck, deleteChapter);

module.exports = router;
