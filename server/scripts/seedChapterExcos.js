/**
 * Seeds chapter executive records (Exco scope:'chapter') for every state
 * chapter — chairman + deputy where known, from the committee's Chapter
 * Chairmen List (July 2026) — and sets rendered page-1 cover images on the
 * official-document BrandMaterial cards.
 *
 * Chairman portraits are reused from the Chapter.image already uploaded to
 * Cloudinary by seedGoLiveContent.js. Idempotent: upserts by
 * (scope, chapter, title).
 *
 * Usage (from the server folder):
 *   node scripts/seedChapterExcos.js [coversDir]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Chapter = require('../models/Chapter');
const Exco = require('../models/Exco');
const BrandMaterial = require('../models/BrandMaterial');

/* [state, chairman, chairPhone, chairEmail, deputy, depPhone, depEmail] */
const CHAPTER_EXECS = [
  ['Abia', 'QS Dr. Michael Nwabueze Anosike, MNIQS', '08037044559', 'abia@niqs.org.ng', null, null, null],
  ['Adamawa', 'QS Benitareni Telu, MNIQS', '08069789950', 'adamawa@niqs.org.ng', 'QS Mahmud Babangida Aliyu, MNIQS', '08039090825', 'qsmahmudba@gmail.com'],
  ['Akwa Ibom', 'QS Iniobong Gabriel Wilson, MNIQS', '08023284808', 'akwaibom@niqs.org.ng', 'QS Edith Sunday Ibanga', '08023878616', 'edithibanga@gmail.com'],
  ['Anambra', 'QS Donatus Chidi Oduenyi, MNIQS', '08033862881', 'anambra@niqs.org.ng', 'QS Emmanuel Okechukwu Nwankwo', '08039329316', 'emmaqs316@gmail.com'],
  ['Bauchi', 'QS Mohammed Abdulhamid, MNIQS', '08065380565', 'niqsbauchichapter@gmail.com', 'QS Bala Hassan', '08062934771', 'balahassangital@gmail.com'],
  ['Bayelsa', 'QS Mabel Morris Amangala, FNIQS', '08037706344', 'bayelsa@niqs.org.ng', 'QS Enize Fidelis Kenigbolo', '08033442223', 'enize2013@gmail.com'],
  ['Benue', 'QS Aliegba Benjamin A., MNIQS', '08181044063', 'benue@niqs.org.ng', 'QS Innocent Granger Ugbudu, MNIQS', '08026691525', 'ugbuduinnocent@yahoo.com'],
  ['Borno', 'QS Zanna Sumayin, FNIQS', '08036152748', 'borno@niqs.org.ng', 'QS Bashir Tanko Tahir, MNIQS', '08036161607', 'tahirbashirtanko@gmail.com'],
  ['Cross River', 'QS Victor Okon Etifit, MNIQS', '08036242410', 'infoniqscrs@gmail.com', null, null, null],
  ['Delta', 'QS Julius Safuakemefa Apodor, FNIQS', '08037113305', 'delta@niqs.org.ng', null, null, null],
  ['Ebonyi', 'QS Kalu Agwu Agha, MNIQS', '08037601289', 'ebonyi@niqs.org.ng', null, null, null],
  ['Edo', 'QS Dr. Ogbu Chukwuemeka Patrick, MNIQS', '08037346343', 'edo@niqs.org.ng', 'QS Eric Uhunmwangho', '08033505043', 'eric.uhunmwangho@uniben.edu'],
  ['Ekiti', 'QS Dr. Comfort Olubunmi Ade-ojo, FNIQS', '08035796823', 'ekiti@niqs.org.ng', 'QS Adeife Oluyemi Ajayi', '07062974355', 'ajayiadeife@yahoo.com'],
  ['Enugu', 'QS Anderson Uchenna Nwajagu, FNIQS', '08033305245', 'enugu@niqs.org.ng', 'QS Okechukwu Ekwelem, FNIQS', '08035889742', 'okechukwuekwelem@yahoo.com'],
  ['FCT', 'QS Ahmed Kankia Usman, FNIQS', '08036983070', 'fct@niqs.org.ng', 'QS Theophilus Ayodele Apere, FNIQS', '08034749009', 'theopere@yahoo.com'],
  ['Gombe', 'QS Maryamu Arab, FNIQS', '08187077700', 'gombe@niqs.org.ng', 'QS Yusuf Ibrahim', '08065868722', 'yusufmaiwake@gmail.com'],
  ['Imo', 'QS Amuda Ogochukwu A., FNIQS', '08069818812', 'imo@niqs.org.ng', 'QS Dennis Nnaemeka Ihezie, MNIQS', '08035424408', 'dencofada@yahoo.com'],
  ['Jigawa', 'QS Dr. Usman Musa, MNIQS', '08033497116', 'jigawa@niqs.org.ng', null, null, null],
  ['Kaduna', 'QS Aluko-Olokun Bukola Adenike, FNIQS', '08033496604', 'kaduna@niqs.org.ng', 'QS Saidu Minin Mohammed, MNIQS', '08037051982', 'smminin@yahoo.com'],
  ['Kano', "QS Gyadi-Gyadi Sa'idu Musa, MNIQS", '08065529012', 'kano@niqs.org.ng', null, null, null],
  ['Katsina', 'QS Abubakar Kusada Yahaya, FNIQS', '08036591444', 'katsina@niqs.org.ng', null, null, null],
  ['Kogi', 'QS Samuel Akoji Audu, MNIQS', '08033355866', 'kogi@niqs.org.ng', null, null, null],
  ['Kwara', 'QS Theophilus Oluwarotimi Olatunde Olowa, FNIQS', '08037301312', '', 'QS Mahmud Tsaragi Zakari, FNIQS', '08033848809', 'hanasmahmud@yahoo.com'],
  ['Lagos', 'QS Rilwan Olanrewaju Balogun, FNIQS', '08028554903', 'lagos@niqs.org.ng', 'QS Olufemi Odunitan Falusi, FNIQS', '08035118991', 'kostkoncious@yahoo.co.uk'],
  ['Nasarawa', 'QS Jibrin Mairiga, FNIQS', '08085912304', 'nasarawa@niqs.org.ng', null, null, null],
  ['Niger', 'QS Umar Dantani Musa, MNIQS', '08035904696', 'niger@niqs.org.ng', null, null, null],
  ['Ogun', 'QS Esther Oluwafolakemi Ola-Ade, FNIQS', '08033291373', 'ogun@niqs.org.ng', null, null, null],
  ['Ondo', 'QS Akinlolu Oyebobola Fadiyimu, FNIQS', '08037202123', 'ondo@niqs.org.ng', null, null, null],
  ['Osun', 'QS Dr. Abiodun Nofiu Musa, MNIQS', '08023457489', 'osun@niqs.org.ng', 'QS Olayinka F. Kingsley-Otaru, FNIQS', '08053068651', 'yinkololo@yahoo.com'],
  ['Oyo', 'QS Oluwade Kolawole Kayode, MNIQS', '08034024304', 'oyo@niqs.org.ng', 'QS Abiodun Oluwaseyi Boluwaji Oyeleke, MNIQS', '08023017123', 'abiodunoyeleke@yahoo.co.uk'],
  ['Plateau', 'QS Nuhu Zawa Machunga, MNIQS', '08035888859', 'plateau@niqs.org.ng', 'QS Abdulrazak Mohammed, MNIQS', '08033487372', 'juneabmo@gmail.com'],
  ['Rivers', 'QS Naomi Sibi Landue, FNIQS', '08033407281', 'rivers@niqs.org.ng', null, null, null],
  ['Sokoto', 'QS Sule Umar, FNIQS', '08035042074', 'sokoto@niqs.org.ng', 'QS Faruku Maliki, MNIQS', '08039367276', 'faruku.maluki@yahoo.com'],
  ['Yobe', 'QS Dikko Bakari Yerima, MNIQS', '08064818961', '', null, null, null],
  ['Zamfara', 'QS Aliyu Gusau Abdullahi, MNIQS', '08065248895', '', null, null, null],
];

const COVER_MAP = {
  'NIQS Constitution': 'niqs-constitution-cover.jpg',
  'Code of Ethics & Professional Conduct': 'niqs-code-of-ethics-cover.jpg',
  'NIQS Membership Guidelines': 'niqs-membership-guidelines-cover.jpg',
  'NIQS Brand Design Reference': 'niqs-brand-design-reference-cover.jpg',
};

async function upsertExco(filter, update) {
  await Exco.findOneAndUpdate(filter, update, { upsert: true });
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('Connected.\n');

  let chairs = 0, deputies = 0;
  for (const [state, chair, phone, email, dep, depPhone, depEmail] of CHAPTER_EXECS) {
    const chapter = await Chapter.findOne({ name: `${state} Chapter` });
    if (!chapter) { console.warn(`!! no chapter for ${state}`); continue; }
    const stateLabel = state === 'FCT' ? 'FCT' : `${state} State`;
    await upsertExco(
      { scope: 'chapter', chapter: chapter._id, title: 'Chapter Chairman' },
      {
        name: chair, state: stateLabel, phone, email: email || '',
        order: 1, isActive: true,
        ...(chapter.image ? { image: chapter.image } : {}),
      }
    );
    chairs++;
    if (dep) {
      await upsertExco(
        { scope: 'chapter', chapter: chapter._id, title: 'Deputy Chairman' },
        {
          name: dep, state: stateLabel, phone: depPhone || '', email: depEmail || '',
          order: 2, isActive: true,
        }
      );
      deputies++;
    }
  }
  console.log(`Chapter execs: ${chairs} chairmen, ${deputies} deputies\n`);

  const coversDir = process.argv[2];
  if (coversDir) {
    for (const [title, file] of Object.entries(COVER_MAP)) {
      const buffer = fs.readFileSync(path.join(coversDir, file));
      const res = await storeBuffer({
        buffer, originalname: file, mimetype: 'image/jpeg', size: buffer.length,
      });
      const upd = await BrandMaterial.updateOne(
        { title },
        { previewType: 'image', previewImage: res.url, previewBackground: '' }
      );
      console.log(`cover ${title} -> ${res.storage} | matched ${upd.matchedCount}`);
    }
  }

  console.log('\nchapter exco total:', await Exco.countDocuments({ scope: 'chapter' }));
  await mongoose.disconnect();
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
