/**
 * Shared file storage — 3-tier:
 *   images < 10 MB      →  Cloudinary  (CLOUDINARY_CLOUD_NAME set) — auto format/quality
 *   PDFs + anything ≥ 10 MB →  Amazon S3   (S3_BUCKET set), served via CloudFront
 *   fallback            →  local /uploads
 *
 * Used by both the admin upload route (/api/upload) and the public, token-gated
 * flyer-request asset upload (/api/flyer-requests/upload), so the behaviour stays
 * identical regardless of who is uploading.
 *
 * PDFs skip Cloudinary at every size: the delivery account blocks public raw PDF
 * access, so a 2 MB constitution used to upload "successfully" and then 401 on
 * download. S3 + CloudFront serves them without that restriction.
 *
 * Credentials: the S3 client takes none explicitly. On ECS it resolves the task
 * role from the container credential endpoint; locally it uses the standard AWS
 * chain (env vars, ~/.aws/credentials, SSO). Never put long-lived keys in env.
 *
 * Objects are written private — CloudFront reads them through an Origin Access
 * Control — so the returned URL is the CDN's, not the bucket's.
 */
const path = require('path');
const fs   = require('fs');

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

/* ── Configure S3 client ── */
let s3 = null;
if (S3Client && process.env.S3_BUCKET) {
  s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-west-1' });
}

const TEN_MB = 10 * 1024 * 1024;

/** uuid-keyed objects are never rewritten, so they can be cached forever. */
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';

/** Public base for S3 objects — CloudFront when configured, else the bucket host. */
function s3PublicBase() {
  const cdn = (process.env.ASSET_CDN_URL || '').replace(/\/$/, '');
  if (cdn) return cdn;
  const region = process.env.AWS_REGION || 'eu-west-1';
  return `https://${process.env.S3_BUCKET}.s3.${region}.amazonaws.com`;
}

function isPdf(file, ext) {
  return ext === '.pdf' || file.mimetype === 'application/pdf';
}

/**
 * Persist a multer in-memory file and return its public URL + metadata.
 * @param {{ buffer: Buffer, originalname: string, mimetype: string, size: number }} file
 */
async function storeBuffer(file) {
  const ext     = path.extname(file.originalname || '').toLowerCase();
  const safeExt = /^[.\w]+$/.test(ext) ? ext : '.bin';
  const uid     = uuidv4();

  /* ── Amazon S3 — PDFs at any size, plus anything ≥ 10 MB ── */
  if ((isPdf(file, safeExt) || file.size >= TEN_MB) && s3) {
    const key = `niqs/${uid}${safeExt}`;
    await s3.send(new PutObjectCommand({
      Bucket:       process.env.S3_BUCKET,
      Key:          key,
      Body:         file.buffer,
      ContentType:  file.mimetype,
      CacheControl: IMMUTABLE_CACHE,
    }));
    return {
      url: `${s3PublicBase()}/${key}`, storage: 's3',
      filename: uid + safeExt, originalName: file.originalname,
      size: file.size, mimeType: file.mimetype,
    };
  }

  /* ── Cloudinary — images < 10 MB ── */
  if (cloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'niqs', public_id: uid },
        (err, r) => err ? reject(err) : resolve(r),
      );
      stream.end(file.buffer);
    });
    return {
      url: result.secure_url, storage: 'cloudinary',
      filename: result.public_id, originalName: file.originalname,
      size: file.size, mimeType: file.mimetype,
    };
  }

  /* ── Local fallback ── */
  const dir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const fname = uid + safeExt;
  fs.writeFileSync(path.join(dir, fname), file.buffer);
  return {
    url: `/uploads/${fname}`, storage: 'local',
    filename: fname, originalName: file.originalname,
    size: file.size, mimeType: file.mimetype,
  };
}

module.exports = { storeBuffer, TEN_MB };
