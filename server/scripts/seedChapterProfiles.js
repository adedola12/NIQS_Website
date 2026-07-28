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
 *   node scripts/seedChapterProfiles.js <portraitsDir> [chapterKey ...] [--no-photos]
 *
 * Naming a chapter limits the run to it. Worth doing: without a filter every
 * chapter re-uploads its whole roster, which is a fresh Cloudinary asset per
 * portrait for no change.
 *
 * --no-photos updates the roster text only and leaves every portrait where it
 * is. That is the common follow-up: the chapter corrects a spelling or confirms
 * a title weeks after its photos went up, and re-uploading them to fix a name
 * would be pure waste. <portraitsDir> is then only checked for existence.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Chapter = require('../models/Chapter');
const Exco = require('../models/Exco');

const portraitsDir = process.argv[2];
const noPhotos = process.argv.includes('--no-photos');
if (!portraitsDir) {
  console.error('Usage: node scripts/seedChapterProfiles.js <portraitsDir> [chapterKey ...] [--no-photos]');
  process.exit(2);
}

/* Roster entries: [portraitSlug, name, title, order]

   Names and titles follow each chapter's own published material, verbatim —
   including whether a person is styled QS, Mr or Miss. Never add "QS" to a name
   a chapter supplied bare without asking them first: on the institute's own site
   that reads as a claim about registration, and Ebonyi's pack shows the chapters
   do distinguish. Ask, then record who confirmed and when.

   `address` is optional. Better absent than invented — the chapter page simply
   drops the line. */
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
  {
    key: 'delta',
    chapterName: 'Delta Chapter',
    state: 'Delta',
    stateLabel: 'Delta State',
    chairperson: 'QS Julius Safuakemefa Apodor, FNIQS',
    secretary: 'QS Akpomiemie Oghenemene Andrew',
    about:
      'The Delta State Chapter of the Nigerian Institute of Quantity Surveyors serves '
      + 'registered quantity surveyors practising across Delta State in the South South '
      + 'geopolitical zone. A fourteen-member executive committee leads the chapter across '
      + 'administration, finance, public relations and research and development, working '
      + 'with the National Secretariat to run continuing professional development '
      + 'programmes, uphold ethical and technical standards in construction cost '
      + 'management, and represent the profession before government, industry and the '
      + 'academic community in the state. The chapter also hosts the Young Quantity '
      + 'Surveyors Forum (YQSF) for Delta.',
    heroPortrait: 'julius-safuakemefa-apodor',
    // Delta's pack gave bare names; the chapter confirmed all fourteen are QS
    // (2026-07-28). Post-nominals still to come for everyone but the chairman.
    roster: [
      ['julius-safuakemefa-apodor', 'QS Julius Safuakemefa Apodor, FNIQS', 'Chapter Chairman', 1],
      ['francis-ogheneyare-okorho', 'QS Francis Ogheneyare Okorho', 'Deputy Chairman', 2],
      ['akpomiemie-oghenemene-andrew', 'QS Akpomiemie Oghenemene Andrew', 'General Secretary', 3],
      ['fortune-eguonoghene-jegbe', 'QS Fortune Eguonoghene Jegbe', 'Assistant General Secretary', 4],
      ['emily-ekata-ikhide', 'QS Emily Ekata Ikhide', 'Treasurer', 5],
      ['omaghomi-noyo-joe', 'QS Omaghomi Noyo Joe', 'Financial Secretary', 6],
      ['omoh-paul-igbebo', 'QS Omoh-Paul Igbebo', 'Assistant Financial Secretary', 7],
      ['ibatere-prosper-un', 'QS Ibatere Prosper U.N.', 'Public Relations Officer', 8],
      ['nwazodoni-samuel-ifechukwude', 'QS Nwazodoni Samuel Ifechukwude', 'Assistant Public Relations Officer', 9],
      ['paul-olorunfemi', 'QS Paul Olorunfemi', 'Research & Development Secretary', 10],
      ['nneli-esther-ifeoma', 'QS Nneli Esther Ifeoma', 'YQSF Coordinator', 11],
      // The pack labels three people simply "Ex. Officio"; numbered here in the
      // order supplied so the records stay distinct.
      ['clement-onowono-aduze', 'QS Dr. Clement Onowono Aduze', 'Ex-Officio I', 12],
      ['martins-osa-izevbokun', 'QS Martins Osa. Izevbokun', 'Ex-Officio II', 13],
      ['siakpere-patrick-onoriode', 'QS Siakpere Patrick Onoriode', 'Ex-Officio III', 14],
    ],
  },
  {
    key: 'ebonyi',
    chapterName: 'Ebonyi Chapter',
    state: 'Ebonyi',
    stateLabel: 'Ebonyi State',
    chairperson: 'QS Agha Kalu Agwu, MNIQS',
    secretary: 'QS Eze Clinton Ogbonnia, MNIQS',
    about:
      'The Ebonyi State Chapter of the Nigerian Institute of Quantity Surveyors brings '
      + 'together registered quantity surveyors practising across Ebonyi State in the '
      + 'South East geopolitical zone. A ten-member executive committee leads the chapter '
      + 'across administration, finance, public relations and research and development, '
      + 'working with the National Secretariat to deliver continuing professional '
      + 'development, uphold professional standards in construction cost management, and '
      + 'advocate for the quantity surveying profession with government and industry '
      + 'stakeholders in the state.',
    heroPortrait: 'agha-kalu-agwu',
    /* Ebonyi resent the pack on 2026-07-28 — this time the executives' own
       photographs rather than the designed cards with the gold caption bar,
       which is what the first run had to crop and matte its way out of. Eight of
       the ten came back, and the General Secretary's name with them: the card
       read "Clinton Eze Ogbonnia", the resend has it as Eze Clinton Ogbonnia.
       The Treasurer and Ex-Officio II were not in the resend, so they keep the
       portraits already published — seeding simply skips a roster entry whose
       file is absent. */
    roster: [
      ['agha-kalu-agwu', 'QS Agha Kalu Agwu, MNIQS', 'Chapter Chairman', 1],
      ['nwafor-eric-eze', 'QS Nwafor Eric Eze, MNIQS', 'Deputy Chairman', 2],
      ['eze-clinton-ogbonnia', 'QS Eze Clinton Ogbonnia, MNIQS', 'General Secretary', 3],
      ['agha-charity-c', 'Miss Agha Charity C.', 'Assistant General Secretary', 4],
      ['adeniyi-gbenga', 'QS Adeniyi Gbenga, MNIQS', 'Treasurer', 5],
      ['aliechem-reuben-c', 'Mr Aliechem Reuben C.', 'Financial Secretary', 6],
      ['abrams-ikechukwu-d', 'Mr Abrams Ikechukwu D.', 'Public Relations Secretary', 7],
      ['onya-benjamin-chinedu', 'QS Onya Benjamin Chinedu, MNIQS', 'Research & Development Secretary', 8],
      ['chukwu-patrick-oko', 'QS Chukwu Patrick Oko, MNIQS', 'Ex-Officio I', 9],
      ['anikwe-nnaemeka-j', 'QS Anikwe Nnaemeka J., MNIQS', 'Ex-Officio II', 10],
    ],
  },
  {
    key: 'nasarawa',
    chapterName: 'Nasarawa Chapter',
    state: 'Nasarawa',
    stateLabel: 'Nasarawa State',
    chairperson: 'QS Jibrin Mairiga, MNIQS',
    secretary: 'QS Z. I. Isah',
    about:
      'The Nasarawa State Chapter of the Nigerian Institute of Quantity Surveyors serves '
      + 'registered quantity surveyors practising across Nasarawa State in the North '
      + 'Central geopolitical zone. An eight-member executive committee leads the chapter '
      + 'across administration, finance, public relations and member welfare, working with '
      + 'the National Secretariat to deliver continuing professional development, uphold '
      + 'professional standards in construction cost management, and advocate for the '
      + 'profession with government and industry stakeholders in the state. The chapter '
      + 'also hosts the Young Quantity Surveyors Forum (YQSF) for Nasarawa.',
    heroPortrait: 'jibrin-mairiga',
    // The pack names everyone by initials only; full names still to come from the chapter.
    roster: [
      ['jibrin-mairiga', 'QS Jibrin Mairiga, MNIQS', 'Chapter Chairman', 1],
      ['a-y-shuaibu', 'QS A. Y. Shuaibu', 'Deputy Chairman', 2],
      ['z-i-isah', 'QS Z. I. Isah', 'General Secretary', 3],
      ['s-a-buba', 'QS S. A. Buba', 'Assistant General Secretary', 4],
      ['m-o-bilyaminu', 'QS M. O. Bilyaminu', 'Treasurer', 5],
      ['y-d-obiya', 'QS Y. D. Obiya', 'Financial Secretary', 6],
      ['a-a-edego', 'QS A. A. Edego', 'Public Relations Secretary', 7],
      ['m-z-adih', 'QS M. Z. Adih', 'YQSF Coordinator', 8],
    ],
  },
  {
    key: 'kaduna',
    chapterName: 'Kaduna Chapter',
    state: 'Kaduna',
    stateLabel: 'Kaduna State',
    chairperson: 'QS Dr. Bukola Aluko-Olokun, FNIQS',
    secretary: 'QS Ozavize Omayoza Ojoro, MNIQS',
    about:
      'The Kaduna State Chapter of the Nigerian Institute of Quantity Surveyors brings '
      + 'together registered quantity surveyors practising across Kaduna State in the '
      + 'North West geopolitical zone. A thirteen-member executive committee leads the '
      + 'chapter across administration, finance, public relations and research and '
      + 'development, working with the National Secretariat to deliver continuing '
      + 'professional development, uphold professional standards in construction cost '
      + 'management, and represent the profession before government, industry and the '
      + 'academic community in the state.',
    heroPortrait: 'bukola-aluko-olokun',
    /* Titles are the chapter's own, from the captions on its senate pack — hence
       "Chairperson" and "Assistant Secretary General" here where other chapters
       say Chairman and Assistant General Secretary. Nothing keys off the exact
       wording; the chapter page renders whatever the record carries.

       The pack ranks nobody: it labels two people "Ex-Officio" and three
       "Co-Opted Member", so I and II and III below are ordering, not the
       chapter's own numbering. Worth confirming before anyone reads seniority
       into it. */
    roster: [
      ['bukola-aluko-olokun', 'QS Dr. Bukola Aluko-Olokun, FNIQS', 'Chapter Chairperson', 1],
      ['mohammed-saidu-minin', 'QS Mohammed Saidu Minin, MNIQS', 'Deputy Chairman', 2],
      ['ozavize-omayoza-ojoro', 'QS Ozavize Omayoza Ojoro, MNIQS', 'General Secretary', 3],
      ['habu-david-obadiah', 'QS Habu David Obadiah, MNIQS', 'Assistant Secretary General', 4],
      ['gabriel-omotayo-oladija', 'QS Gabriel Omotayo Oladija, FNIQS', 'Treasurer', 5],
      ['jamil-mohammed-ibrahim', 'QS Jamil Mohammed Ibrahim, MNIQS', 'Financial Secretary', 6],
      ['gyorend-simon-yangs', 'QS Gyorend Simon Yangs, MNIQS', 'Public Relations Officer', 7],
      ['hassana-mailabari-kumo', 'QS Dr. Hassana Mailabari Kumo, MNIQS', 'Research & Development Secretary', 8],
      ['timothy-o-oluwasakin', 'QS Timothy O. Oluwasakin, FNIQS', 'Ex-Officio I', 9],
      ['muinat-omolara-sanni', 'QS Muinat Omolara Sanni, MNIQS', 'Ex-Officio II', 10],
      ['rebacca-kingsley-madaki', 'QS Dr. Rebacca Kingsley Madaki, FNIQS', 'Co-opted Member I', 11],
      ['khadijat-yusuf', 'QS Khadijat Yusuf', 'Co-opted Member II', 12],
      ['yusuf-musa-uba', 'QS Yusuf Musa Uba, MNIQS', 'Co-opted Member III', 13],
    ],
  },
  {
    key: 'fct',
    chapterName: 'FCT Chapter',
    state: 'FCT',
    stateLabel: 'FCT',
    chairperson: 'QS Ahmed Usman Kankia, FNIQS',
    secretary: 'QS Buhari Tanko Haruna, FNIQS',
    about:
      'The FCT Chapter of the Nigerian Institute of Quantity Surveyors serves registered '
      + 'quantity surveyors practising across the Federal Capital Territory. Sitting in '
      + "the seat of federal government, the chapter works closest to the institute's "
      + 'National Secretariat, and its chairman represents the Territory on the National '
      + 'Executive Council. A fourteen-member executive committee leads the chapter across '
      + 'administration, finance, public relations and education and professional '
      + 'development, delivering continuing professional development, upholding standards '
      + 'in construction cost management, and representing the profession before '
      + 'government, industry and the academic community in Abuja. The chapter also hosts '
      + 'the Young Quantity Surveyors Forum (YQSF) and West African Quantity Surveyors '
      + 'Network coordination for the FCT.',
    heroPortrait: 'ahmed-usman-kankia',
    /* Roster read from the chapter's "Senate Members FCT CHAPTER" document, whose
       wording is followed here — including the YQSF Coordinator, the one name it
       supplies bare, which stays bare.

       Three names the document and the photo captions disagree on, all recorded
       below the way the weight of evidence points and all worth a line back to
       the chapter: the chairman ("Kankika" in the document against Kankia in its
       own filename and in the secretariat's caption of 2026-07-27); Ex-Officio II
       ("Uzor Amaka" against Uzoamaka); and the WAQSN representative (Gowom
       against Gowon). The Deputy Chairman keeps the fuller "Ayodele" already
       published rather than the document's "Ayo" — the same name, not a
       correction.

       Fourteen executives, thirteen portraits: no photograph came with the pack
       for the YQSF Coordinator, so his card renders as a monogram until one does. */
    roster: [
      ['ahmed-usman-kankia', 'QS Ahmed Usman Kankia, FNIQS', 'Chapter Chairman', 1],
      ['theophilus-ayo-apere', 'QS Theophilus Ayodele Apere, FNIQS', 'Deputy Chairman', 2],
      ['buhari-tanko-haruna', 'QS Buhari Tanko Haruna, FNIQS', 'General Secretary', 3],
      ['ayuba-musa', 'QS Ayuba Musa, MNIQS', 'Assistant General Secretary', 4],
      ['abel-gankon-dawah', 'QS Abel Gankon Dawah, FNIQS', 'Treasurer', 5],
      ['yusuf-jamiu-adewale', 'QS Yusuf Jamiu Adewale, MNIQS', 'Financial Secretary', 6],
      ['adamu-musa-barau', 'QS Adamu Musa Barau, MNIQS', 'Public Relations Secretary', 7],
      ['mustapha-muhd-abdullahi', "QS Mustapha Muh'd Abdullahi, FNIQS", 'Education & Professional Development Secretary', 8],
      ['ahmed-tijjani-lawal', 'QS Ahmed Tijjani Lawal, MNIQS', 'Ex-Officio I', 9],
      ['uzoamaka-okobia', 'QS Uzoamaka Okobia, MNIQS', 'Ex-Officio II', 10],
      ['mary-b-gowom', 'QS Mary B. Gowom, FNIQS', 'WAQSN Representative', 11],
      ['abdulrafiu-abdullahi', 'Abdulrafiu Abdullahi', 'YQSF Coordinator', 12],
      ['zemo-masha-alexander', 'QS Zemo Masha Alexander, FNIQS', 'Co-opted Member I', 13],
      ['uwem-justine-glory', 'QS Uwem Justine Glory, MNIQS', 'Co-opted Member II', 14],
    ],
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('Connected.\n');

  const only = process.argv.slice(3).filter(a => !a.startsWith('--')).map(s => s.toLowerCase());
  const selected = only.length ? CHAPTERS.filter(c => only.includes(c.key)) : CHAPTERS;
  const unknown = only.filter(k => !CHAPTERS.some(c => c.key === k));
  if (unknown.length) { console.error(`unknown chapter key(s): ${unknown.join(', ')}`); process.exit(2); }

  for (const c of selected) {
    const chapter = await Chapter.findOne({ name: c.chapterName });
    if (!chapter) { console.warn(`!! no chapter document for ${c.chapterName}`); continue; }

    console.log(`── ${c.chapterName} ──`);
    const urls = {};

    for (const [slug, name, title, order] of c.roster) {
      let storage = 'text only';
      if (!noPhotos) {
        /* A roster entry whose portrait is absent still gets its text written —
           only the photo is skipped. That is what --no-photos means, and it is
           also what a partial pack needs: when a chapter resends eight of ten
           portraits, the other two must keep the images they already have
           without their names and order going unwritten. */
        const file = path.join(portraitsDir, c.key, `${c.key}-${slug}.jpg`);
        if (!fs.existsSync(file)) {
          console.warn(`   !! missing portrait ${file} — text only`);
        } else {
          const buffer = fs.readFileSync(file);
          const stored = await storeBuffer({
            buffer, originalname: `${c.key}-${slug}.jpg`, mimetype: 'image/jpeg', size: buffer.length,
          });
          urls[slug] = stored.url;
          storage = stored.storage;
        }
      }

      await Exco.findOneAndUpdate(
        { scope: 'chapter', chapter: chapter._id, title },
        {
          name, title, scope: 'chapter', chapter: chapter._id, state: c.stateLabel,
          order, isActive: true, ...(urls[slug] ? { image: urls[slug] } : {}),
        },
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
      ...(c.address ? { address: c.address } : {}),
      chairperson: c.chairperson,
      secretary: c.secretary,
      ...(urls[c.heroPortrait] ? { image: urls[c.heroPortrait] } : {}),
    });
    console.log(`   chapter profile updated (${c.roster.length} executives)\n`);
  }

  await mongoose.disconnect();
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
