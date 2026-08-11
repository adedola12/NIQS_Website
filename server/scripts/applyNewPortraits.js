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
  /* Re-framed, not re-supplied — the chapter's original file was fine and this is
     built from it. normalizePortraits.py mis-scaled this one badly: it published
     at face height 0.164 of the canvas with the eye line at 0.049, against the
     0.328 / 0.363 every other portrait on the site sits at. On the card that read
     as a small full-length figure with the top of his head clipped by the frame
     and a smear of backdrop below him, next to thirteen head-and-shoulders
     colleagues.

     The source has only 322px above the eye line where that framing needs 411, so
     it cannot simply be cropped tighter — the studio backdrop is a flat grey and
     was extended upward to make the headroom, then the crop was cut to the
     president's own face geometry before matting. Re-measured after: 0.320 / 0.359.
     Worth knowing if another portrait comes back the same way. */
  {
    file: 'lagos-adewumi-samuel.jpg',
    label: 'QS Adewumi Samuel, MNIQS — Lagos Co-opted Member III (re-framed to a headshot)',
    model: 'Exco',
    filter: { scope: 'chapter', title: 'Co-opted Member III', name: 'QS Adewumi Samuel, MNIQS' },
  },
  /* Plateau sent its chairman alone rather than a roster, so this chapter stays a
     chairman-only stub and gets no block in seedChapterProfiles.js — only a
     better photograph than the one it already carried.

     His name is left as the committee's Chapter Chairmen List has it. The file is
     captioned "QS NUHU MACHUNGA" and the record reads "QS Nuhu Zawa Machunga",
     and everywhere else on this site the chapter's own material has won that
     disagreement — but everywhere else that material was a full pack with a
     roster behind it. A single filename is thinner evidence than the list it
     would be overturning, so the name stands and the difference is recorded here
     for Plateau to settle. */
  {
    file: 'plateau-nuhu-machunga.jpg',
    label: 'QS Nuhu Zawa Machunga, MNIQS — Plateau Chapter Chairman (replacement photo)',
    model: 'Exco',
    // "Plateau State", not "Plateau" — chapter-scope Exco records carry the full
    // state label. The FCT entry above matches on "FCT" only because that chapter
    // has no "State" in its name, which makes this an easy one to copy wrongly.
    filter: { scope: 'chapter', title: 'Chapter Chairman', state: 'Plateau State' },
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
