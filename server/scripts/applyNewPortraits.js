/**
 * Publishes newly supplied portraits — normalised onto the president's backdrop
 * by normalizePortraits.py — onto the leadership records that were still showing
 * initials-on-navy, or carrying a photo the subject asked to replace.
 *
 * One entry per person, naming the collection and an exact filter, because these
 * arrive one or two at a time from the secretariat rather than as a chapter pack.
 * Chapter chairmen also exist on the NEC and as the chapter's hero image; run
 * reconcileChapterChairmen.js afterwards to carry the photo across.
 *
 * Usage (from the server folder):
 *   node scripts/applyNewPortraits.js <normalisedDir> [--apply]
 * Without --apply it only reports.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Exco = require('../models/Exco');
const PastPresident = require('../models/PastPresident');

const dir = process.argv[2];
const apply = process.argv.includes('--apply');
if (!dir) {
  console.error('Usage: node scripts/applyNewPortraits.js <normalisedDir> [--apply]');
  process.exit(2);
}

const MODELS = { Exco, PastPresident };

const ITEMS = [
  {
    file: 'fct-chapter-chairman-kankia-usman.jpg',
    label: 'QS Kankia Usman, FNIQS — FCT Chapter Chairman (first photo)',
    model: 'Exco',
    filter: { scope: 'chapter', title: 'Chapter Chairman', state: 'FCT' },
  },
  {
    file: 'yqsf-chairman-abubakar-ahmed-maigatari.jpg',
    label: 'QS Abubakar Ahmed Maigatari, MNIQS — YQSF Chairman (replacement he sent)',
    model: 'Exco',
    filter: { scope: 'national', title: 'YQSF Chairman' },
  },
  {
    file: 'past-president-obafemi-onashile.jpg',
    label: 'QS Obafemi O. Onashile, FNIQS — Past President (first photo of the 13)',
    model: 'PastPresident',
    filter: { name: 'QS Obafemi O. Onashile, FNIQS' },
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log(`Connected. ${apply ? 'APPLYING' : 'dry run — pass --apply to write'}\n`);

  for (const { file, label, model, filter } of ITEMS) {
    const full = path.join(dir, file);
    if (!fs.existsSync(full)) { console.error(`SKIPPED ${label}\n  missing ${full}\n`); continue; }

    const M = MODELS[model];
    const found = await M.find(filter).select('name image').lean();
    if (found.length !== 1) {
      console.error(`SKIPPED ${label}\n  ${model} filter matched ${found.length} records, expected 1\n`);
      continue;
    }

    console.log(`── ${label} ──`);
    console.log(`   ${model}: ${found[0].name} — was ${found[0].image ? 'showing a photo' : 'showing initials'}`);
    if (!apply) { console.log(''); continue; }

    const buffer = fs.readFileSync(full);
    const { url, storage } = await storeBuffer({
      buffer, originalname: file, mimetype: 'image/jpeg', size: buffer.length,
    });
    await M.updateOne(filter, { image: url });
    console.log(`   ${storage} → ${url}\n`);
  }

  await mongoose.disconnect();
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
