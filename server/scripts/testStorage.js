/**
 * Diagnostic: verify the two production storage tiers actually deliver files.
 * Run from server/:  node scripts/testStorage.js
 *
 * Checks (as of 2026-07-09 both FAIL — see output):
 *   1. Cloudinary tier: uploads a small PDF via storeBuffer, then fetches the
 *      returned URL unauthenticated. 401 means the account-level
 *      "Allow delivery of PDF and ZIP files" security setting is still off
 *      (Cloudinary console → Settings → Security). Signed URLs do NOT bypass it.
 *   2. R2 tier: direct PutObject + ListObjectsV2 against R2_BUCKET_NAME.
 *      403 AccessDenied means the API token lacks Object Read & Write on this
 *      bucket (or bucket/account mismatch). Also note R2_PUBLIC_URL must be an
 *      r2.dev public bucket URL or custom domain — the *.r2.cloudflarestorage.com
 *      S3 endpoint never serves objects publicly.
 *
 * Cleans up every asset it creates.
 */
require('dotenv').config();
const { storeBuffer } = require('../utils/storage');

const MINI_PDF = Buffer.from(
  '%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
  '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
  '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n' +
  'trailer<</Root 1 0 R>>\n%%EOF\n'
);

async function fetchStatus(url, label) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    console.log(`${label}: HTTP ${res.status} ${res.statusText}`);
    console.log(`  ${url}`);
    return res.status;
  } catch (e) {
    console.log(`${label}: FETCH ERROR ${e.message}`);
    return -1;
  }
}

(async () => {
  let failures = 0;

  console.log('=== Cloudinary tier: small PDF via storeBuffer ===');
  try {
    const stored = await storeBuffer({
      buffer: MINI_PDF, originalname: 'storage-diagnostic.pdf',
      mimetype: 'application/pdf', size: MINI_PDF.length,
    });
    console.log(`stored via: ${stored.storage}`);
    const status = await fetchStatus(stored.url, 'unauthenticated GET');
    if (status !== 200) failures++;
    if (stored.storage === 'cloudinary') {
      const cloudinary = require('cloudinary').v2;
      await cloudinary.uploader.destroy(stored.filename, { resource_type: 'image' });
    }
  } catch (e) {
    console.log('storeBuffer FAILED:', e.message);
    failures++;
  }

  console.log('\n=== R2 tier: direct PutObject / ListObjectsV2 ===');
  try {
    const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } =
      require('@aws-sdk/client-s3');
    const r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    const key = 'niqs/storage-diagnostic.pdf';
    try {
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME, Key: key,
        Body: MINI_PDF, ContentType: 'application/pdf',
      }));
      console.log('PutObject: OK');
      const base = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
      const status = await fetchStatus(`${base}/${key}`, 'unauthenticated GET via R2_PUBLIC_URL');
      if (status !== 200) failures++;
      await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
    } catch (e) {
      console.log(`PutObject FAILED: ${e.name} ${e.$metadata?.httpStatusCode ?? ''} — ${e.message}`);
      failures++;
    }
    try {
      await r2.send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET_NAME, MaxKeys: 1 }));
      console.log('ListObjectsV2: OK (token can read bucket)');
    } catch (e) {
      console.log(`ListObjectsV2 FAILED: ${e.name} ${e.$metadata?.httpStatusCode ?? ''} — ${e.message}`);
    }
  } catch (e) {
    console.log('R2 test setup failed:', e.message);
    failures++;
  }

  console.log(failures ? `\n${failures} storage check(s) FAILED` : '\nAll storage checks passed');
  process.exit(failures ? 1 : 0);
})();
