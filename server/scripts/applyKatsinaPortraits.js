/**
 * Repoints named Katsina executives at re-normalised portraits.
 *
 * Katsina is the one chapter that never sent photographs — only a designed
 * senate poster — so all sixteen portraits are crops off it, and seven of them
 * defeated the u2net matte badly enough to be published as raw crops: a tight
 * head on the poster's own background, at a different scale from every other
 * card on the site. That is what "they do not fit" looks like.
 *
 * u2net_human_seg mattes five of the seven where u2net could not, so those crops
 * finally composite onto the president's backdrop at the same face size and eye
 * line as everyone else.
 *
 * The last two defeat every model tried — u2net, u2net_human_seg and
 * isnet-general-use all return either a floating head or the subject plus a
 * rectangle of the room behind her. Maryam Mua'azu's and Sadiya Sani Yar'Adua's
 * are therefore framed rather than cut out (normalizePortraits --no-matte):
 * their own photograph, scaled and placed on the house face geometry over a
 * blurred fill of its own colours. They keep their own background, which does
 * not match the studio brown — but the complaint being answered is that a card
 * showed a head at twice the size of its neighbours, and that is fixed. Proper
 * portraits from the chapter would still be better than either.
 *
 * Nothing else is touched. The nine portraits u2net already did are fine, and
 * re-matting two of those made them worse, so they are deliberately not in the
 * list below.
 *
 * Usage (from the server folder):
 *   node scripts/applyKatsinaPortraits.js <portraitsDir> [--dry]
 *
 * <portraitsDir> holds katsina-<slug>.jpg for each slug named here.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Chapter = require('../models/Chapter');
const Exco = require('../models/Exco');

const portraitsDir = process.argv[2];
const dry = process.argv.includes('--dry');
if (!portraitsDir) {
  console.error('Usage: node scripts/applyKatsinaPortraits.js <portraitsDir> [--dry]');
  process.exit(2);
}

/* [slug, exco title] — five rescued by human_seg, two framed unmatted. */
const FIXED = [
  ['abubakar-yahaya-kusada', 'Chapter Chairman'],
  ['kabir-bawale-nasiru', 'Financial Secretary'],
  ['muhammad-laminu-ibrahim', 'Ex-Officio II'],
  ['shamsuddeen-hassan', 'Immediate Past Chairman'],
  ['shehu-samaila', 'Ex-Officio I'],
  ['maryam-muaazu', 'Welfare Director'],
  ['sadiya-sani-yaradua', 'WAQS Coordinator'],
];

/* The chapter card and the chairman share one image, so the hero follows him. */
const HERO_SLUG = 'abubakar-yahaya-kusada';

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log(`Connected. ${dry ? 'dry run' : 'APPLYING'}\n── Katsina Chapter ──`);

  const chapter = await Chapter.findOne({ name: 'Katsina Chapter' });
  if (!chapter) { console.error('!! no Katsina Chapter document'); process.exit(1); }

  let heroUrl = null;
  for (const [slug, title] of FIXED) {
    const file = path.join(portraitsDir, `katsina-${slug}.jpg`);
    if (!fs.existsSync(file)) { console.warn(`   !! missing ${file}`); continue; }

    const rec = await Exco.findOne({ scope: 'chapter', chapter: chapter._id, title });
    if (!rec) { console.warn(`   !! no exco record titled "${title}"`); continue; }

    if (dry) { console.log(`   would update ${title} — ${rec.name}`); continue; }

    const buffer = fs.readFileSync(file);
    const stored = await storeBuffer({
      buffer, originalname: `katsina-${slug}.jpg`, mimetype: 'image/jpeg', size: buffer.length,
    });
    await Exco.updateOne({ _id: rec._id }, { image: stored.url });
    if (slug === HERO_SLUG) heroUrl = stored.url;
    console.log(`   ${stored.storage.padEnd(10)} ${title} — ${rec.name}`);
  }

  if (heroUrl) {
    await Chapter.updateOne({ _id: chapter._id }, { image: heroUrl });
    console.log('   chapter hero repointed at the chairman');
  }

  await mongoose.disconnect();
  console.log('\nDone.');
})().catch((e) => { console.error(e); process.exit(1); });
