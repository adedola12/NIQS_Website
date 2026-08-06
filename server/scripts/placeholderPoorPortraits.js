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
  ['Katsina State', "QS Sadiya Sani Yar'Adua, MNIQS"],   // raw rectangle, margin 103
  ['Katsina State', "QS Maryam Mua'azu, MNIQS"],         // raw rectangle, margin 48
  ['Katsina State', 'Ahmed Salisu'],                     // B/G 1.48
  ['Katsina State', 'Aminu Labo'],                       // B/G 1.38, red clipped at 246
  ['Katsina State', 'QS Muhammad Laminu Ibrahim, PhD, MNIQS'], // B/G 1.17
  ['Katsina State', 'QS Adamu Idris, MNIQS'],            // B/G 1.10, G/R 0.31

  /* Added 2026-08-06, from a re-audit of all 316 published portraits against a
     backdrop plate taken from the portraits themselves. That pass confirms the
     5 August sweep caught every matte failure — corner drift now peaks at 1.56
     across the whole site, against a threshold of 8 — and turned up exactly one
     card still unfit to publish.

     His source is cropped so close under the chin that the matte found no
     shoulders at all, and the composite is a head on a thin neck stalk over open
     backdrop. It has been visible since Ogun was published; the QC gate flagged
     it at the time and it went out anyway, before the secretariat set the
     placeholder rule. It is the clearest case on the site for that rule.

     Nine other portraits flagged on softness or colour and all nine keep their
     cards: each is a complete, recognisable photograph of a person, which a
     monogram is not. Cool studio lighting and a blue suit lift blue-over-green
     without any of the channel crushing that marks a poster crop. */
  ['Ogun State', 'QS Temitayo Fasasi'],                  // head detached from torso
];
(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log(apply ? 'APPLYING\n' : 'dry run — pass --apply\n');
  for (const [state, name] of NAMES) {
    const found = await Exco.find({ scope: 'chapter', state, name }).select('name title image');
    if (found.length !== 1) { console.log(`   !! ${name}: matched ${found.length}`); continue; }
    if (!found[0].image) { console.log(`   ${'(already placeholder)'.padEnd(34)} ${name}`); continue; }
    if (apply) await Exco.updateOne({ _id: found[0]._id }, { $unset: { image: '' } });
    console.log(`   ${found[0].title.padEnd(34)} ${name}`);
  }
  await mongoose.disconnect();
})().catch(e => { console.error(e); process.exit(1); });
