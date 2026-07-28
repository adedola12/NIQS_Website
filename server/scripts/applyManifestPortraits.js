/**
 * Publishes a normalised portrait set described by a manifest, so a whole
 * re-normalisation lands in one pass.
 *
 * Written for the sweep that put every leadership portrait on one backdrop: the
 * NEC and body-head cards were composited by an older run and sat on a visibly
 * different backdrop with face sizes ranging 255-495px and eye lines 307-520px,
 * against 356/432 for everything normalised since. Chapter rosters are not in
 * here — seedChapterProfiles.js already owns those.
 *
 * The manifest is [{ group, slug, model, filter }]; the image is read from
 * <normalisedDir>/<group>/<slug>.jpg. Every filter must match exactly one
 * record or the entry is skipped and reported — a filter that quietly matched
 * two would overwrite a portrait nobody asked to change.
 *
 * Usage (from the server folder):
 *   node scripts/applyManifestPortraits.js <manifest.json> <normalisedDir> [--apply]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { storeBuffer } = require('../utils/storage');
const Exco = require('../models/Exco');
const PastPresident = require('../models/PastPresident');
const Chapter = require('../models/Chapter');

const [manifestPath, normDir] = process.argv.slice(2);
const apply = process.argv.includes('--apply');
if (!manifestPath || !normDir) {
  console.error('Usage: node scripts/applyManifestPortraits.js <manifest.json> <normalisedDir> [--apply]');
  process.exit(2);
}

const MODELS = { Exco, PastPresident, Chapter };

(async () => {
  const items = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log(`Connected. ${items.length} manifest entries. ${apply ? 'APPLYING' : 'dry run — pass --apply to write'}\n`);

  let ok = 0;
  const problems = [];

  for (const { group, slug, model, filter } of items) {
    const file = path.join(normDir, group, `${slug}.jpg`);
    if (!fs.existsSync(file)) { problems.push(`${group}/${slug}: no normalised file`); continue; }

    const M = MODELS[model];
    if (!M) { problems.push(`${group}/${slug}: unknown model ${model}`); continue; }

    const found = await M.find(filter).select('name title').lean();
    if (found.length !== 1) {
      problems.push(`${group}/${slug}: ${model} filter matched ${found.length}, expected 1 — ${JSON.stringify(filter)}`);
      continue;
    }

    if (apply) {
      const buffer = fs.readFileSync(file);
      const { url } = await storeBuffer({
        buffer, originalname: `${slug}.jpg`, mimetype: 'image/jpeg', size: buffer.length,
      });
      await M.updateOne(filter, { image: url });
    }
    ok++;
    console.log(`   ${group}/${slug}  →  ${found[0].name}${found[0].title ? ` (${found[0].title})` : ''}`);
  }

  console.log(`\n${ok}/${items.length} ${apply ? 'published' : 'ready'}`);
  if (problems.length) {
    console.log('\nNOT DONE:');
    problems.forEach(p => console.log(`   ${p}`));
  }

  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
