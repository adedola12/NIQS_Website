/**
 * Creates chapter records for states that have none.
 *
 * NIQS has a chapter in all 36 states and the FCT, and the site says so — the
 * YQSF page states 37 and the chapters map draws 37 tiles. The register held only
 * 35: Kebbi and Taraba had no Chapter document at all, so the homepage's derived
 * "State Chapters" figure read 35 and the two states rendered as tiles with no
 * record behind them.
 *
 * The fix is a record, not a smaller number. These are deliberately bare — name,
 * state, zone — with no chairperson, no about copy and no portrait, exactly like
 * the other unprofiled chapters. A full profile follows when the chapter sends
 * its material, through seedChapterProfiles.js.
 *
 * Idempotent: matches on name and leaves an existing record untouched, so it can
 * be re-run safely and will never overwrite a profile seeded later.
 *
 * Usage (from the server folder):
 *   node scripts/seedMissingChapters.js [--apply]
 *
 * Without --apply it reports what it would create and writes nothing.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Chapter = require('../models/Chapter');

const APPLY = process.argv.includes('--apply');

/* Every state NIQS has a chapter in, with its geopolitical zone. Kept whole
   rather than just the two missing ones so the script stays the answer to
   "which chapters should exist" if another goes missing. */
const ALL = [
  ['Abia', 'South East'], ['Adamawa', 'North East'], ['Akwa Ibom', 'South South'],
  ['Anambra', 'South East'], ['Bauchi', 'North East'], ['Bayelsa', 'South South'],
  ['Benue', 'North Central'], ['Borno', 'North East'], ['Cross River', 'South South'],
  ['Delta', 'South South'], ['Ebonyi', 'South East'], ['Edo', 'South South'],
  ['Ekiti', 'South West'], ['Enugu', 'South East'], ['FCT', 'North Central'],
  ['Gombe', 'North East'], ['Imo', 'South East'], ['Jigawa', 'North West'],
  ['Kaduna', 'North West'], ['Kano', 'North West'], ['Katsina', 'North West'],
  ['Kebbi', 'North West'], ['Kogi', 'North Central'], ['Kwara', 'North Central'],
  ['Lagos', 'South West'], ['Nasarawa', 'North Central'], ['Niger', 'North Central'],
  ['Ogun', 'South West'], ['Ondo', 'South West'], ['Osun', 'South West'],
  ['Oyo', 'South West'], ['Plateau', 'North Central'], ['Rivers', 'South South'],
  ['Sokoto', 'North West'], ['Taraba', 'North East'], ['Yobe', 'North East'],
  ['Zamfara', 'North West'],
];

/* Records store the state as "Abia State" but the FCT bare, so compare on a
   normalised key rather than the raw field — matching on the raw value is what
   made an earlier pass think only FCT existed. */
const norm = (s) => String(s || '').replace(/\s+state$/i, '').trim();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Chapter.find({}, 'name state').lean();
  const have = new Set(existing.map((c) => norm(c.state) || norm(c.name).replace(/\s+chapter$/i, '')));

  const missing = ALL.filter(([state]) => !have.has(state));
  console.log(`chapters on record: ${existing.length} of ${ALL.length}`);
  if (!missing.length) {
    console.log('nothing missing.');
    await mongoose.disconnect();
    return;
  }
  console.log(`missing: ${missing.map(([s]) => s).join(', ')}`);

  if (!APPLY) {
    console.log('\ndry run — pass --apply to create them.');
    await mongoose.disconnect();
    return;
  }

  for (const [state, zone] of missing) {
    const name = `${state} Chapter`;
    const stateLabel = state === 'FCT' ? 'FCT' : `${state} State`;
    // The pre-save hook builds the slug.
    await Chapter.create({ name, state: stateLabel, zone, isActive: true });
    console.log(`  created ${name} (${zone})`);
  }
  const total = await Chapter.countDocuments();
  console.log(`\ndone — ${total} chapters on record.`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
