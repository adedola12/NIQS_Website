/**
 * Writes reprocessed chapter portraits back: uploads each normalized file and
 * points its Exco record — and the chapter's own hero image where that record
 * supplied it — at the new URL.
 *
 * Reads the manifest written by exportChapterPortraits.js. Files listed in
 * --skip are left on their existing image, so a portrait the matting pipeline
 * flagged can be held back without holding back the whole batch.
 *
 * Usage (from the server folder):
 *   node scripts/applyChapterPortraits.js <manifestPath> <normalizedDir> [--skip a.jpg,b.jpg] [--dry]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Exco = require('../models/Exco');
const Chapter = require('../models/Chapter');

const [manifestPath, normalizedDir] = process.argv.slice(2);
if (!manifestPath || !normalizedDir) {
  console.error('Usage: node scripts/applyChapterPortraits.js <manifestPath> <normalizedDir> [--skip a.jpg,b.jpg] [--dry]');
  process.exit(2);
}
const dry = process.argv.includes('--dry');
const skipArg = process.argv[process.argv.indexOf('--skip') + 1];
const skip = new Set(process.argv.includes('--skip') && skipArg ? skipArg.split(',').map(s => s.trim()) : []);

(async () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log(`Connected.${dry ? '  (DRY RUN — nothing will be written)' : ''}\n`);

  let applied = 0, skipped = 0, missing = 0;
  for (const m of manifest) {
    if (skip.has(m.file)) { console.log(`   skip     ${m.file}`); skipped++; continue; }
    const full = path.join(normalizedDir, m.file);
    if (!fs.existsSync(full)) { console.warn(`   !! missing ${m.file}`); missing++; continue; }

    if (dry) { console.log(`   would    ${m.file}  → ${m.name} (${m.chapterName})`); applied++; continue; }

    const buffer = fs.readFileSync(full);
    const { url, storage } = await storeBuffer({
      buffer, originalname: m.file, mimetype: 'image/jpeg', size: buffer.length,
    });
    await Exco.updateOne({ _id: m.excoId }, { image: url });
    if (m.isChapterImage && m.chapterId) {
      await Chapter.updateOne({ _id: m.chapterId }, { image: url });
    }
    applied++;
    console.log(`   ${storage.padEnd(10)} ${m.name} — ${m.chapterName}${m.isChapterImage ? ' (+ chapter hero)' : ''}`);
  }

  console.log(`\napplied ${applied}, skipped ${skipped}, missing ${missing}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
