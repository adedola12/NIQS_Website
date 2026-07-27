/**
 * Publishes the output of retouchPortraits.py.
 *
 * Deliberately narrower than applyNormalizedPortraits.js, which fans a chapter
 * chairman's photo out to the Chapter hero, the chapter-scope Exco record and
 * the NEC record all at once. A retouch fixes one card that someone complained
 * about, and the other records may legitimately be pointing at a different
 * render — Jigawa's chapter page carries its own, from the later chapter-portrait
 * run, on a slightly different backdrop. So each item names its target exactly
 * and nothing else is touched.
 *
 * Usage (from the server folder):
 *   node scripts/applyRetouchedPortraits.js <retouchedDir>
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Exco = require('../models/Exco');

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node scripts/applyRetouchedPortraits.js <retouchedDir>');
  process.exit(2);
}

// [file in <retouchedDir>, human label, exact Exco filter]
const ITEMS = [
  ['NATIONAL-BODY-HEADS__acqs-chairman-qs-adamu-yanda-fniqs.jpg',
    'QS Adamu Yanda Shehu, FNIQS — ACQS Chairman (torso carried to the frame edge)',
    { scope: 'body-heads', name: 'QS Adamu Yanda Shehu, FNIQS' }],

  ['NEC__jigawa-chapter-chairman-qs-dr-usman-musa-mniqs.jpg',
    'QS Usman Musa, MNIQS — NEC card only (re-centred; chapter page keeps its own render)',
    { scope: 'national', title: 'Jigawa State Chapter Chairman' }],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('Connected.\n');

  for (const [file, label, filter] of ITEMS) {
    const full = path.join(dir, file);
    const before = await Exco.find(filter).select('name title image').lean();
    if (before.length !== 1) {
      console.error(`SKIPPED ${label}\n  filter matched ${before.length} records, expected 1`);
      continue;
    }

    const buffer = fs.readFileSync(full);
    const { url, storage } = await storeBuffer({
      buffer, originalname: file, mimetype: 'image/jpeg', size: buffer.length,
    });
    await Exco.updateOne(filter, { image: url });

    console.log(`${label}\n  ${storage}: ${before[0].image}\n       →  ${url}\n`);
  }

  await mongoose.disconnect();
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
