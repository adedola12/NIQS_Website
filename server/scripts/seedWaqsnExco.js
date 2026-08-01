/**
 * Publishes the Women Association of Quantity Surveyors in Nigeria's national
 * executive (Exco scope:'waqsn') from the association's own pack, July 2026.
 *
 * The WAQSN page carried only its Chairperson, borrowed from her NEC card,
 * because she was the only member the secretariat's go-live package covered —
 * the same gap seedYqsfExco.js closed for the Young Quantity Surveyors Forum.
 * This seeds the other twenty so the association gets the same treatment as every
 * other body on the site.
 *
 * The roster splits in two and the order values keep them apart: the ten national
 * officers run 1-10, and the eleven zonal coordinators run 11-21, ordered North,
 * South, then West so the geography reads sensibly rather than alphabetically.
 *
 * Portraits are read from <portraitsDir>/waqsn/waqsn-<slug>.jpg, uploaded through
 * the shared storage helper and attached to the record. Idempotent: members are
 * matched by (scope, title), and any waqsn-scope record whose title is no longer
 * on the roster is retired.
 *
 * Usage (from the server folder):
 *   node scripts/seedWaqsnExco.js <portraitsDir> [--no-photos]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Exco = require('../models/Exco');

const portraitsDir = process.argv[2];
const noPhotos = process.argv.includes('--no-photos');
if (!portraitsDir) {
  console.error('Usage: node scripts/seedWaqsnExco.js <portraitsDir> [--no-photos]');
  process.exit(2);
}

/* [slug, name, title, order]

   Names and post-nominals are exactly as the pack captioned them. Unlike the
   YQSF pack, every WAQSN entry arrived styled — QS throughout, with FNIQS or
   MNIQS on all but one — so nothing here was added on anyone's behalf.

   Titles are the pack's own, with only casing normalised and one obvious
   misspelling corrected ("ZONAL CORDINATOR SOUTH 1"). The Chairperson's file is
   captioned "WAQSN CHAIRPERSON"; the WAQSN prefix is dropped here because every
   record in this scope is already WAQSN's and the page prints the title beneath
   her name.

   Four of the twenty-one portraits come from sources cropped too tightly for the
   matting to find shoulders. They publish with the backdrop fade rather than a
   smear, but are worth re-shooting: hadiza-larai-muhammed, idayat-o-oladipo,
   olufunke-omowumi-ojolowo and priscilla-o-okeke. */
const EXEC = [
  /* National officers */
  ['ololade-sokoya', 'QS Ololade Sokoya, FNIQS', 'Chairperson', 1],
  ['aluko-veronica-mojisola', 'QS Aluko Veronica Mojisola, FNIQS', 'Deputy Chairperson', 2],
  ['bukola-aluko-olokun', 'QS Dr. Bukola Aluko-Olokun, FNIQS', 'Immediate Past Chairperson', 3],
  ['udoette-unyimeabasi', 'QS Udoette Unyimeabasi, FNIQS', 'General Secretary', 4],
  ['priscilla-o-okeke', 'QS Priscilla O. Okeke, FNIQS', 'Assistant General Secretary', 5],
  ['olufunke-omowumi-ojolowo', 'QS Olufunke Omowumi Ojolowo, MNIQS', 'Treasurer', 6],
  ['otunola-bunmi-tayo', 'QS Otunola Bunmi Tayo, MNIQS', 'Financial Secretary', 7],
  ['feyisetan-leo-olagbaye', 'QS Dr. Feyisetan Leo-Olagbaye, FNIQS', 'Research & Development Secretary', 8],
  ['obiageri-juliet-asogu', 'QS Obiageri Juliet Asogu, MNIQS', 'Publicity Secretary', 9],
  ['mary-balagbogbo-gowon', 'QS Mary Balagbogbo Gowon, FNIQS', 'Social Secretary', 10],

  /* Zonal coordinators — North, then South, then West */
  ['chime-grace', 'QS Chime Grace, MNIQS', 'Zonal Coordinator, North 1', 11],
  ['maria-musa-mukaddas', 'QS Maria Musa Mukaddas, MNIQS', 'Zonal Coordinator, North 2', 12],
  ['zainab-mustapha-muhammad', 'QS Zainab Mustapha Muhammad', 'Zonal Coordinator, North 3', 13],
  ['hadiza-larai-muhammed', 'QS Hadiza Larai Muhammed, MNIQS', 'Zonal Coordinator, North 4', 14],
  ['ekong-idongesit-usang', 'QS Ekong Idongesit Usang, MNIQS', 'Zonal Coordinator, South 1', 15],
  ['anyigor-bridget-ifunanya', 'QS Anyigor Bridget Ifunanya, MNIQS', 'Zonal Coordinator, South 2', 16],
  ['okwukwu-precious-oma', 'QS Okwukwu Precious Oma, MNIQS', 'Zonal Coordinator, South 3', 17],
  ['ikpefan-augustina', 'QS Ikpefan Augustina, MNIQS', 'Zonal Coordinator, South 4', 18],
  ['okoh-monisola-rachel', 'QS Okoh Monisola Rachel, FNIQS', 'Zonal Coordinator, West 1', 19],
  ['idayat-o-oladipo', 'QS Idayat O. Oladipo, MNIQS', 'Zonal Coordinator, West 2', 20],
  ['adenike-olubunmi-ademiluyi', 'QS Adenike Olubunmi Ademiluyi, MNIQS', 'Zonal Coordinator, West 3', 21],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('Connected.\n-- WAQSN National Executive --');

  for (const [slug, name, title, order] of EXEC) {
    let storage = 'text only';
    let image;
    if (!noPhotos) {
      const file = path.join(portraitsDir, 'waqsn', `waqsn-${slug}.jpg`);
      if (!fs.existsSync(file)) {
        console.warn(`   !! missing portrait ${file} — text only`);
      } else {
        const buffer = fs.readFileSync(file);
        const stored = await storeBuffer({
          buffer, originalname: `waqsn-${slug}.jpg`, mimetype: 'image/jpeg', size: buffer.length,
        });
        image = stored.url;
        storage = stored.storage;
      }
    }

    await Exco.findOneAndUpdate(
      { scope: 'waqsn', title },
      { name, title, scope: 'waqsn', order, isActive: true, ...(image ? { image } : {}) },
      { upsert: true },
    );
    console.log(`   ${storage.padEnd(10)} ${String(order).padStart(2)}. ${title} — ${name}`);
  }

  const keepTitles = EXEC.map(([, , title]) => title);
  const stale = await Exco.deleteMany({ scope: 'waqsn', title: { $nin: keepTitles } });
  if (stale.deletedCount) console.log(`   removed ${stale.deletedCount} stale record(s)`);

  await mongoose.disconnect();
  console.log(`\nDone — ${EXEC.length} executive members.`);
})().catch((e) => { console.error(e); process.exit(1); });
