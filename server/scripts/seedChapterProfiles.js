/**
 * Publishes full chapter profiles — about copy, contact block and the complete
 * executive roster with portraits — for the chapters whose material the
 * secretariat has supplied.
 *
 * Portraits are read from <portraitsDir>/<chapterKey>/<chapterKey>-<slug>.jpg
 * (prepared from the chapter's own group poster / photo pack), uploaded through
 * the shared storage helper, and attached to Exco records scoped to the chapter.
 *
 * Idempotent: chapters are matched by name, exco by (scope, chapter, title).
 * Existing phone/email on a record are preserved unless this file supplies them.
 *
 * Usage (from the server folder):
 *   node scripts/seedChapterProfiles.js <portraitsDir>
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Chapter = require('../models/Chapter');
const Exco = require('../models/Exco');

const portraitsDir = process.argv[2];
if (!portraitsDir) {
  console.error('Usage: node scripts/seedChapterProfiles.js <portraitsDir>');
  process.exit(2);
}

/* Roster entries: [portraitSlug, name, title, order]
   Names and titles follow each chapter's own published material. */
const CHAPTERS = [
  {
    key: 'katsina',
    chapterName: 'Katsina Chapter',
    state: 'Katsina',
    stateLabel: 'Katsina State',
    chairperson: 'QS Abubakar Yahaya Kusada, FNIQS',
    secretary: "QS Sada Rabi'u Zare, MNIQS",
    address: 'NIQS Katsina State Chapter Secretariat, Katsina',
    about:
      'The Katsina State Chapter of the Nigerian Institute of Quantity Surveyors '
      + 'brings together registered quantity surveyors practising across Katsina State '
      + 'in the North West geopolitical zone. The chapter is led by a sixteen-member '
      + 'executive committee covering administration, finance, research and development, '
      + 'public relations and member welfare, and works alongside the National '
      + 'Secretariat to deliver continuing professional development, uphold professional '
      + 'standards in construction cost management, and advocate for the quantity '
      + 'surveying profession with government and industry stakeholders in the state. '
      + 'The chapter also hosts the Young Quantity Surveyors Forum (YQSF) and West '
      + 'African Quantity Surveyors coordination for Katsina.',
    // Portrait used as the chapter's hero / card image
    heroPortrait: 'abubakar-yahaya-kusada',
    roster: [
      ['abubakar-yahaya-kusada', 'QS Abubakar Yahaya Kusada, FNIQS', 'Chapter Chairman', 1],
      ['kabir-lawal', 'QS Kabir Lawal, MNIQS', 'Vice Chairman', 2],
      ['sada-rabiu-zare', "QS Sada Rabi'u Zare, MNIQS", 'General Secretary', 3],
      ['ahmed-salisu', 'Ahmed Salisu', 'Assistant General Secretary', 4],
      ['muntari-isiyaku', 'QS Muntari Isiyaku, MNIQS', 'Treasurer', 5],
      ['kabir-bawale-nasiru', 'QS Kabir Bawale Nasiru, MNIQS', 'Financial Secretary', 6],
      ['adamu-idris', 'QS Adamu Idris, MNIQS', 'Assistant Financial Secretary', 7],
      ['usman-sabo-nalado', 'QS Usman Sabo Nalado, MNIQS', 'Research & Development Secretary', 8],
      ['yazid-ibrahim-muhammad', "QS Yazid Ibrahim Muh'd, MNIQS", 'Director of Public Relations', 9],
      ['maryam-muaazu', "QS Maryam Mua'azu, MNIQS", 'Welfare Director', 10],
      ['shamsuddeen-hassan', 'QS Shamsuddeen Hassan, FNIQS', 'Immediate Past Chairman', 11],
      ['shehu-samaila', 'QS Shehu Samaila, MNIQS', 'Ex-Officio I', 12],
      ['muhammad-laminu-ibrahim', 'QS Muhammad Laminu Ibrahim, PhD, MNIQS', 'Ex-Officio II', 13],
      ['aminu-labo', 'Aminu Labo', 'Ex-Officio III', 14],
      ['sadiq-yusuf', 'Sadiq Yusuf', 'YQSF Coordinator', 15],
      ['sadiya-sani-yaradua', "QS Sadiya Sani Yar'Adua, MNIQS", 'WAQS Coordinator', 16],
    ],
  },
  {
    key: 'osun',
    chapterName: 'Osun Chapter',
    state: 'Osun',
    stateLabel: 'Osun State',
    chairperson: 'QS Dr. Nofiu Abiodun Musa, MNIQS',
    secretary: 'QS Oyeniran Taofeek Bamidele',
    address: 'NIQS Osun State Chapter Secretariat, Osogbo, Osun State',
    about:
      'The Osun State Chapter of the Nigerian Institute of Quantity Surveyors serves '
      + 'registered quantity surveyors practising across Osun State in the South West '
      + 'geopolitical zone. A ten-member executive committee leads the chapter across '
      + 'administration, finance, public relations and research and development, working '
      + 'with the National Secretariat to run continuing professional development '
      + 'programmes, uphold ethical and technical standards in construction cost '
      + 'management, and represent the profession before government, industry and the '
      + 'academic community in the state.',
    heroPortrait: 'nofiu-abiodun-musa',
    roster: [
      ['nofiu-abiodun-musa', 'QS Dr. Nofiu Abiodun Musa, MNIQS', 'Chapter Chairman', 1],
      ['olayinka-kingsley-otaru', 'QS Olayinka F. Kingsley-Otaru, FNIQS', 'Deputy Chairman', 2],
      ['oyeniran-taofeek-bamidele', 'QS Oyeniran Taofeek Bamidele', 'General Secretary', 3],
      ['sanusi-isaac-olakunle', 'Sanusi Isaac Olakunle', 'Assistant General Secretary', 4],
      ['oladosu-ismaila-damilola', 'QS Oladosu Ismaila Damilola', 'Treasurer', 5],
      ['fasanmoye-joy-oluwaseyi', 'QS Mrs. Fasanmoye Joy Oluwaseyi', 'Financial Secretary', 6],
      ['salaudeen-abd-rasheed-adekunle', 'QS Salaudeen Abd-Rasheed Adekunle', 'Public Relations Secretary', 7],
      ['adegoke-bolanle-felicia', 'QS Dr. Mrs. Adegoke Bolanle Felicia', 'Research & Development Secretary', 8],
      ['adegoke-johnson-olufemi', 'QS Adegoke Johnson Olufemi', 'Ex-Officio — Immediate Past Chairman', 9],
      ['adenike-ademiluyi', 'QS Mrs. Adenike Ademiluyi', 'Ex-Officio — WAQSON', 10],
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('Connected.\n');

  for (const c of CHAPTERS) {
    const chapter = await Chapter.findOne({ name: c.chapterName });
    if (!chapter) { console.warn(`!! no chapter document for ${c.chapterName}`); continue; }

    console.log(`── ${c.chapterName} ──`);
    const urls = {};

    for (const [slug, name, title, order] of c.roster) {
      const file = path.join(portraitsDir, c.key, `${c.key}-${slug}.jpg`);
      if (!fs.existsSync(file)) { console.warn(`   !! missing portrait ${file}`); continue; }
      const buffer = fs.readFileSync(file);
      const { url, storage } = await storeBuffer({
        buffer, originalname: `${c.key}-${slug}.jpg`, mimetype: 'image/jpeg', size: buffer.length,
      });
      urls[slug] = url;

      await Exco.findOneAndUpdate(
        { scope: 'chapter', chapter: chapter._id, title },
        { name, title, scope: 'chapter', chapter: chapter._id, state: c.stateLabel, image: url, order, isActive: true },
        { upsert: true },
      );
      console.log(`   ${storage.padEnd(10)} ${String(order).padStart(2)}. ${title} — ${name}`);
    }

    /* Retire any stale chapter-scope record that is no longer on the roster
       (e.g. an older "Deputy Chairman" title replaced by "Vice Chairman"). */
    const keepTitles = c.roster.map(([, , title]) => title);
    const stale = await Exco.deleteMany({
      scope: 'chapter', chapter: chapter._id, title: { $nin: keepTitles },
    });
    if (stale.deletedCount) console.log(`   removed ${stale.deletedCount} stale exco record(s)`);

    await Chapter.updateOne({ _id: chapter._id }, {
      about: c.about,
      address: c.address,
      chairperson: c.chairperson,
      secretary: c.secretary,
      ...(urls[c.heroPortrait] ? { image: urls[c.heroPortrait] } : {}),
    });
    console.log(`   chapter profile updated (${c.roster.length} executives)\n`);
  }

  await mongoose.disconnect();
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
