require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Exco = require('../models/Exco');
const apply = process.argv.includes('--apply');
/* Portraits cut from Katsina's printed group poster. The print crushed the green
   channel and clipped red, so the faces carry a magenta or violet cast that no
   white balance can undo — correcting the ratio just amplifies green noise into
   a wash. Two of them never matted at all and show the source's own rectangle.
   The secretariat's instruction (2026-08-05) is to use the placeholder wherever
   quality is poor, which is better than any of these. */
const NAMES = [
  "QS Sadiya Sani Yar'Adua, MNIQS",   // raw rectangle, margin 103
  "QS Maryam Mua'azu, MNIQS",         // raw rectangle, margin 48
  'Ahmed Salisu',                     // B/G 1.48
  'Aminu Labo',                       // B/G 1.38, red clipped at 246
  'QS Muhammad Laminu Ibrahim, PhD, MNIQS', // B/G 1.17
  'QS Adamu Idris, MNIQS',            // B/G 1.10, G/R 0.31
];
(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log(apply ? 'APPLYING\n' : 'dry run — pass --apply\n');
  for (const name of NAMES) {
    const found = await Exco.find({ scope: 'chapter', state: 'Katsina State', name }).select('name title image');
    if (found.length !== 1) { console.log(`   !! ${name}: matched ${found.length}`); continue; }
    if (apply) await Exco.updateOne({ _id: found[0]._id }, { $unset: { image: '' } });
    console.log(`   ${found[0].title.padEnd(34)} ${name}`);
  }
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
