/**
 * Smart upload route — 3-tier storage:
 *   < 10 MB  →  Cloudinary   (CLOUDINARY_CLOUD_NAME env set)
 *   ≥ 10 MB  →  Cloudflare R2 (R2_ACCOUNT_ID env set)
 *   fallback →  local /uploads
 *
 * Install optional deps:
 *   npm install cloudinary @aws-sdk/client-s3 uuid
 *
 * Env vars needed:
 *   CLOUDINARY_CLOUD_NAME  CLOUDINARY_API_KEY  CLOUDINARY_API_SECRET
 *   R2_ACCOUNT_ID  R2_ACCESS_KEY_ID  R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME  R2_PUBLIC_URL
 */

const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { protect, adminOnly } = require('../middleware/auth');

/* ── Optional cloud deps with graceful fallback ── */
let cloudinary = null;
try { cloudinary = require('cloudinary').v2; } catch (_) {}

let S3Client = null, PutObjectCommand = null;
try {
  const s3 = require('@aws-sdk/client-s3');
  S3Client = s3.S3Client; PutObjectCommand = s3.PutObjectCommand;
} catch (_) {}

let uuidv4 = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
try { uuidv4 = require('uuid').v4; } catch (_) {}

/* ── Configure Cloudinary ── */
if (cloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/* ── Configure R2 client ── */
let r2 = null;
if (S3Client && process.env.R2_ACCOUNT_ID) {
  r2 = new S3Client({
    region:   'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

const TEN_MB = 10 * 1024 * 1024;

/* Memory storage — stream directly to cloud, nothing written to disk unless fallback */
const memUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 500 * 1024 * 1024 }, // 500 MB hard cap
});

router.post('/', protect, adminOnly, memUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const file    = req.file;
    const ext     = path.extname(file.originalname).toLowerCase();
    const safeExt = /^[.\w]+$/.test(ext) ? ext : '.bin';
    const uid     = uuidv4();

    /* ── Cloudflare R2 — files ≥ 10 MB ── */
    if (file.size >= TEN_MB && r2 && process.env.R2_BUCKET_NAME) {
      const key = `niqs/${uid}${safeExt}`;
      await r2.send(new PutObjectCommand({
        Bucket:      process.env.R2_BUCKET_NAME,
        Key:         key,
        Body:        file.buffer,
        ContentType: file.mimetype,
      }));
      const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
      return res.json({
        url: `${base}/${key}`, storage: 'r2',
        filename: uid + safeExt, originalName: file.originalname,
        size: file.size, mimeType: file.mimetype,
      });
    }

    /* ── Cloudinary — files < 10 MB ── */
    if (cloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'niqs', public_id: uid },
          (err, r) => err ? reject(err) : resolve(r),
        );
        stream.end(file.buffer);
      });
      return res.json({
        url: result.secure_url, storage: 'cloudinary',
        filename: result.public_id, originalName: file.originalname,
        size: file.size, mimeType: file.mimetype,
      });
    }

    /* ── Local fallback ── */
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fname = uid + safeExt;
    fs.writeFileSync(path.join(dir, fname), file.buffer);
    return res.json({
      url: `/uploads/${fname}`, storage: 'local',
      filename: fname, originalName: file.originalname,
      size: file.size, mimeType: file.mimetype,
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
