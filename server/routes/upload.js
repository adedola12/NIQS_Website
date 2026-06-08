/**
 * Admin upload route — persists a file via the shared 3-tier storage util
 * (Cloudinary < 10 MB, Cloudflare R2 ≥ 10 MB, local fallback). See utils/storage.js.
 */
const router = require('express').Router();
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/auth');
const { storeBuffer } = require('../utils/storage');

/* Memory storage — stream directly to cloud, nothing written to disk unless fallback */
const memUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 500 * 1024 * 1024 }, // 500 MB hard cap
});

router.post('/', protect, adminOnly, memUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const stored = await storeBuffer(req.file);
    res.json(stored);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
