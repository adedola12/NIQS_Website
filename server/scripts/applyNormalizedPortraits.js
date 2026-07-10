/**
 * Uploads the background-normalized portraits (subjects composited onto a warm
 * brown studio gradient matching the president) to Cloudinary and points the
 * matching leadership records at the new URLs.
 *
 * Body heads + Treasurer: matched by exact name.
 * Chapter chairmen: matched by chapter state — updates the Chapter hero image,
 * the chapter-scope Exco chairman, AND any NEC national-scope record for that
 * state (e.g. Jigawa's chairman also sits on the NEC).
 *
 * Usage (from the server folder):
 *   node scripts/applyNormalizedPortraits.js <finalDir>
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Exco = require('../models/Exco');
const Chapter = require('../models/Chapter');

const finalDir = process.argv[2];
if (!finalDir) { console.error('Usage: node scripts/applyNormalizedPortraits.js <finalDir>'); process.exit(2); }

// [composite filename (without F__ prefix), person name, chapter state or null]
const ITEMS = [
  ['CHAPTER-CHAIRMEN__ogun-chapter-chairman-qs-esther-ola-ade-fniqs.jpg', 'QS Esther Oluwafolakemi Ola-Ade, FNIQS', 'Ogun'],
  ['CHAPTER-CHAIRMEN__bauchi-chapter-chairman-qs-mohammed-abdulhamid-mniqs.jpg', 'QS Mohammed Abdulhamid, MNIQS', 'Bauchi'],
  ['CHAPTER-CHAIRMEN__kogi-chapter-chairman-qs-samuel-akoji-audu-mniqs.jpg', 'QS Samuel Akoji Audu, MNIQS', 'Kogi'],
  ['CHAPTER-CHAIRMEN__yobe-chapter-chairman-qs-dikko-bakari-yerima-mniqs.jpg', 'QS Dikko Bakari Yerima, MNIQS', 'Yobe'],
  ['NEC__jigawa-chapter-chairman-qs-dr-usman-musa-mniqs.jpg', 'QS Dr. Usman Musa, MNIQS', 'Jigawa'],
  ['PORTFOLIO-OFFICERS__treasurer.jpg', 'QS Hawwa Audi Muhammad, FNIQS', null],
  ['NATIONAL-BODY-HEADS__fellows-forum-chairman-qs-kayode-osokomiya.jpg', 'QS Kayode Osokomaiya, FNIQS', null],
  ['NATIONAL-BODY-HEADS__dg-niqs-foundation-qs-dr-celestina-nkechi-eke-fniqs.jpg', 'QS Dr Celestina Nkechi Eke, FNIQS', null],
  ['NATIONAL-BODY-HEADS__dg-qs-academy-qs-ayodele-faleye-fniqs.jpg', 'QS Ayodele Faleye, FNIQS', null],
  ['NATIONAL-BODY-HEADS__aqsco-chairman-qs-faith-ezeugoh.jpg', 'QS Faith Ezeugoh, FNIQS', null],
  ['NATIONAL-BODY-HEADS__aqsps-chairman-qs-fausat-ajibade-fniqs.jpg', 'QS Fausat Ajibade, FNIQS', null],
  ['NATIONAL-BODY-HEADS__aqsle-chairman-qs-prof-ahmad-doko.jpg', 'QS Prof. Ahmad Doko Ibrahim, FNIQS', null],
  ['NATIONAL-BODY-HEADS__acqs-chairman-qs-adamu-yanda-fniqs.jpg', 'QS Adamu Yanda Shehu, FNIQS', null],
  ['NATIONAL-BODY-HEADS__examination-board-chairman-auwalu-sani-shehu.jpg', 'QS Auwalu Sani Shehu, FNIQS', null],
  ['NATIONAL-BODY-HEADS__chairman-editorial-board-the-quantity-surveyor-journal-qs-prof-rufus-ogunsemi.jpg', 'QS Prof Rufus Ogunsemi, FNIQS', null],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('Connected.\n');

  for (const [fname, name, state] of ITEMS) {
    const full = path.join(finalDir, 'F__' + fname);
    const buffer = fs.readFileSync(full);
    const { url, storage } = await storeBuffer({
      buffer, originalname: 'F__' + fname, mimetype: 'image/jpeg', size: buffer.length,
    });

    let hits = 0;
    const byName = await Exco.updateMany({ name }, { image: url });
    hits += byName.modifiedCount;

    if (state) {
      const chapter = await Chapter.findOne({ name: `${state} Chapter` });
      if (chapter) {
        await Chapter.updateOne({ _id: chapter._id }, { image: url });
        const byChapter = await Exco.updateMany(
          { chapter: chapter._id, title: 'Chapter Chairman' }, { image: url });
        hits += byChapter.modifiedCount;
      }
      // NEC national-scope record for this state (e.g. Jigawa chairman sits on NEC)
      const byNec = await Exco.updateMany(
        { scope: 'national', title: new RegExp('^' + state + '\\b', 'i') }, { image: url });
      hits += byNec.modifiedCount;
    }

    console.log(`${storage.padEnd(10)} ${name}  → records touched: ${hits}`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
})().catch((e) => { console.error(e); process.exit(1); });
