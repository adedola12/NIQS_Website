const router = require('express').Router();
const {
  generateLink,
  getLinkContext,
  createRequest,
  uploadAssetMw,
  uploadAsset,
  listRequests,
  getRequest,
  updateStatus,
  deleteRequest,
} = require('../controllers/flyerRequestController');
const { protect, adminOnly } = require('../middleware/auth');

// ── Public — intake form ──
router.post('/', createRequest);                       // submit a request
router.get('/context/:token', getLinkContext);         // resolve a shared-link token for display
router.post('/upload', uploadAssetMw, uploadAsset);    // token-gated image upload (speaker photo / reference)

// ── Admin ──
router.post('/link', protect, adminOnly, generateLink);   // generate a shareable link
router.get('/', protect, adminOnly, listRequests);
router.get('/:id', protect, adminOnly, getRequest);
router.patch('/:id/status', protect, adminOnly, updateStatus);
router.delete('/:id', protect, adminOnly, deleteRequest);

module.exports = router;
