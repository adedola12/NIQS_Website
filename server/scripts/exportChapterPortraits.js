/**
 * Dumps every chapter-scope exco portrait to a working folder, plus a manifest
 * mapping each file back to its Exco _id, so portraits can be reprocessed
 * offline and written back by applyChapterPortraits.js.
 *
 * Usage (from the server folder):
 *   node scripts/exportChapterPortraits.js <outDir>
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Exco = require('../models/Exco');
const Chapter = require('../models/Chapter');

const outDir = process.argv[2];
if (!outDir) { console.error('Usage: node scripts/exportChapterPortraits.js <outDir>'); process.exit(2); }

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* Cloudinary pulls time out on a congested link — retry rather than lose the run. */
async function fetchWithRetry(url, tries = 6) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      if (i === tries) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (i === tries) throw e;
    }
    await new Promise(r => setTimeout(r, 2000 * i));
  }
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  fs.mkdirSync(outDir, { recursive: true });

  const records = await Exco.find({ scope: 'chapter', image: { $nin: ['', null] } })
    .populate('chapter', 'name state image')
    .sort('chapter order')
    .lean();

  const manifest = [];
  for (const r of records) {
    const chapterSlug = slug((r.chapter && r.chapter.name) || 'unknown');
    const file = `${chapterSlug}__${slug(r.name)}.jpg`;
    let buf;
    try { buf = await fetchWithRetry(r.image); }
    catch (e) { console.warn(`!! failed ${file}: ${e.message}`); continue; }
    fs.writeFileSync(path.join(outDir, file), buf);
    manifest.push({
      file,
      excoId: String(r._id),
      name: r.name,
      title: r.title,
      chapterId: r.chapter ? String(r.chapter._id) : null,
      chapterName: r.chapter ? r.chapter.name : null,
      // Whether this portrait is also the chapter's own hero image
      isChapterImage: !!(r.chapter && r.chapter.image && r.chapter.image === r.image),
      sourceUrl: r.image,
    });
    console.log(`${manifest.length.toString().padStart(2)}. ${file}`);
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n${manifest.length} portraits → ${outDir}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
