/**
 * Reconciles a chapter chairman's NEC card with his chapter page.
 *
 * A chapter chairman exists twice: once at chapter scope, and once on the NEC
 * (scope 'national', titled "<State> State Chapter Chairman"). The two were
 * seeded from different sources months apart, so the same person can appear
 * under a different spelling on each page, and the NEC copy is often the one
 * still showing initials-on-navy because only the chapter sent a photo.
 *
 * This makes the NEC card agree with the chapter: one spelling, one portrait.
 * The chapter-scope record is the source of truth, because that is what the
 * chapter itself published.
 *
 * Usage (from the server folder):
 *   node scripts/reconcileChapterChairmen.js [--apply]
 * Without --apply it only reports.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Chapter = require('../models/Chapter');
const Exco = require('../models/Exco');

const apply = process.argv.includes('--apply');

/* Where the two records disagree on the name, the spelling to settle on.
   Only listed where the chapter's material and the NEC differ and someone has
   confirmed which is right — otherwise the chapter's own wording wins. */
const NAME_OVERRIDES = {
  // Secretariat's own caption, 2026-07-27: "QS KANKIA USMAN, FNIQS". The chapter's
  // senate roster of 2026-07-28 supplies the full name but spells the surname
  // "Kankika" — against Kankia in the secretariat's caption and in the chapter's
  // own photo filename, so it reads as a slip of the keyboard. Full name from the
  // roster, surname from the two that agree.
  FCT: 'QS Ahmed Usman Kankia, FNIQS',
};

/* When both records already carry a portrait they are usually two different
   shoots of the same person, and the newer one is not automatically the better
   one — Nasarawa's chapter pack is a full-length phone photo cropped to the head,
   while the NEC still holds a proper studio shot. Name the side to keep; states
   left out keep whatever each record already has. */
const PREFER_PHOTO = {
  Nasarawa: 'nec',
  // FCT sent its senate portraits on 2026-07-28; the chairman's is now normalised
  // onto the same backdrop as everyone else, so the NEC should take it.
  FCT: 'chapter',
};

/* Only chapters whose chairman also holds an NEC seat belong here — there are 13
   of those, and Rivers is not among them, so its chairman exists once and needs
   no reconciling. */
const STATES = ['FCT', 'Delta', 'Ebonyi', 'Nasarawa'];

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log(`Connected. ${apply ? 'APPLYING' : 'dry run — pass --apply to write'}\n`);

  for (const state of STATES) {
    const chapter = await Chapter.findOne({ name: `${state} Chapter` });
    if (!chapter) { console.warn(`!! no chapter document for ${state}`); continue; }

    const chapterRec = await Exco.findOne({
      scope: 'chapter', chapter: chapter._id, title: 'Chapter Chairman',
    });
    const necRec = await Exco.findOne({
      scope: 'national', title: new RegExp(`^${state}\\b.*Chapter Chairman$`, 'i'),
    });
    if (!chapterRec || !necRec) {
      console.warn(`!! ${state}: chapter record ${!!chapterRec}, NEC record ${!!necRec}`);
      continue;
    }

    const name = NAME_OVERRIDES[state] || chapterRec.name;

    // Never overwrite a portrait with a different one by default — only fill a
    // gap, or follow an explicit PREFER_PHOTO call.
    let image;
    if (necRec.image && chapterRec.image) {
      image = PREFER_PHOTO[state] === 'nec' ? necRec.image
        : PREFER_PHOTO[state] === 'chapter' ? chapterRec.image : null;
    } else {
      image = chapterRec.image || necRec.image || null;
    }

    const changes = [];
    if (necRec.name !== name) changes.push(`NEC name      "${necRec.name}" → "${name}"`);
    if (chapterRec.name !== name) changes.push(`chapter name  "${chapterRec.name}" → "${name}"`);
    if (image && necRec.image !== image) {
      changes.push(`NEC photo     ${necRec.image ? 'switched to the chapter\'s' : 'added (was showing initials)'}`);
    }
    if (image && chapterRec.image !== image) {
      changes.push(`chapter photo ${chapterRec.image ? "switched to the NEC's" : 'added (was showing initials)'}`);
    }
    if (!necRec.image && !chapterRec.image) changes.push('still no photo on either record');

    console.log(`── ${state} ──`);
    if (!changes.length) { console.log('   already consistent\n'); continue; }
    changes.forEach(c => console.log(`   ${c}`));

    if (apply) {
      await Exco.updateOne({ _id: necRec._id }, { name, ...(image ? { image } : {}) });
      await Exco.updateOne({ _id: chapterRec._id }, { name, ...(image ? { image } : {}) });
      await Chapter.updateOne({ _id: chapter._id },
        { chairperson: name, ...(image ? { image } : {}) });
      console.log('   written');
    }
    console.log('');
  }

  await mongoose.disconnect();
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
