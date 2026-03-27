const router = require('express').Router();
const { getAllNews, getNewsBySlug, createNews, updateNews, deleteNews, getAdminNews } = require('../controllers/newsController');
const { protect, adminOnly } = require('../middleware/auth');
const { chapterScope, deleteCheck } = require('../middleware/roleCheck');

// Public routes
router.get('/', getAllNews);
router.get('/:slug', getNewsBySlug);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAdminNews);
router.post('/', protect, adminOnly, chapterScope, createNews);
router.put('/:id', protect, adminOnly, chapterScope, updateNews);
router.delete('/:id', protect, adminOnly, deleteCheck, deleteNews);

module.exports = router;
