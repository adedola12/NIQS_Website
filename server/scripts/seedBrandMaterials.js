/**
 * Publishes the 2026 brand pack on the Brand Materials page, and repairs the
 * guideline row that was added by hand.
 *
 * Two things were wrong with that row. Its fileUrl was a Google Drive /view
 * link, which opens a viewer rather than downloading — under a button reading
 * "Download PDF" — and it depended on the Drive sharing staying public, unlike
 * the other four rows which are served from client/public/documents. And it
 * carried order:4, the same as "NIQS Brand Design Reference", so the two sorted
 * against each other arbitrarily. The title also read "GUideline".
 *
 * The guideline PDF now ships in the repo with the rest, and the logo pack —
 * all twelve official files, both lockups and the emblem, each in a dark and a
 * light variant — joins it as a download.
 *
 * Fonts are deliberately not here. Bricolage Grotesque and Sora are applied to
 * the site itself as self-hosted variable fonts rather than offered as a
 * download; if members ever ask for the files, the OFL originals are on Google
 * Fonts and the licence texts ship in client/public/fonts.
 *
 * Idempotent: rows are matched on title, including the misspelled one, so a
 * re-run updates rather than duplicates.
 *
 * Usage (from the server folder):
 *   node scripts/seedBrandMaterials.js [--dry-run]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const BrandMaterial = require('../models/BrandMaterial');

const dryRun = process.argv.includes('--dry-run');

/* Each entry lists every title it should match, so the row added by hand under
   the misspelled title is updated in place rather than left beside a new one. */
const ROWS = [
  {
    matchTitles: ['NIQS Brand Guideline 2026', 'NIQS BrandGUideline 2026', 'NIQS Brand GUideline 2026'],
    doc: {
      title: 'NIQS Brand Guideline 2026',
      description:
        'The full brand guideline — the official navy and gold with their HEX, RGB, CMYK and Pantone values, the extended scales, typography and logo usage rules.',
      buttonLabel: 'Download PDF',
      fileUrl: '/documents/niqs-brand-guideline-2026.pdf',
      previewType: 'gradient',
      previewImage: '',
      previewBackground: 'linear-gradient(135deg,#000066 50%,#D9B650 100%)',
      imageFilter: '',
      order: 5,
      isPublished: true,
    },
  },
  {
    matchTitles: ['NIQS Logo Pack'],
    doc: {
      title: 'NIQS Logo Pack',
      description:
        'Every official mark in one download: the horizontal and vertical lockups and the emblem, each supplied for dark and light backgrounds, in PNG and JPEG.',
      buttonLabel: 'Download ZIP',
      fileUrl: '/documents/niqs-logo-pack.zip',
      previewType: 'image_contained',
      previewImage: '/brand/lockup-horizontal-dark.png',
      previewBackground: 'var(--navy)',
      imageFilter: '',
      order: 6,
      isPublished: true,
    },
  },
];

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set — check server/.env');
    process.exit(2);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`connected${dryRun ? ' (dry run — nothing will be written)' : ''}`);

  const before = await BrandMaterial.find().sort({ order: 1 }).lean();
  console.log(`\nbefore — ${before.length} rows:`);
  before.forEach(r => console.log(`  [${r.order}] ${r.title}  ->  ${r.fileUrl || '(no file)'}`));

  for (const { matchTitles, doc } of ROWS) {
    const existing = await BrandMaterial.findOne({ title: { $in: matchTitles } });
    if (!existing) {
      if (dryRun) { console.log(`\nwould CREATE  ${doc.title}`); continue; }
      await BrandMaterial.create(doc);
      console.log(`\ncreated  ${doc.title}`);
      continue;
    }
    const changes = Object.keys(doc).filter(k => String(existing[k] ?? '') !== String(doc[k]));
    if (!changes.length) { console.log(`\nunchanged  ${doc.title}`); continue; }
    if (dryRun) {
      console.log(`\nwould UPDATE  ${existing.title}`);
      changes.forEach(k => console.log(`    ${k}: ${JSON.stringify(existing[k])} -> ${JSON.stringify(doc[k])}`));
      continue;
    }
    Object.assign(existing, doc);
    await existing.save();
    console.log(`\nupdated  ${existing.title}`);
    changes.forEach(k => console.log(`    ${k}`));
  }

  const after = await BrandMaterial.find().sort({ order: 1 }).lean();
  console.log(`\nafter — ${after.length} rows:`);
  after.forEach(r => console.log(`  [${r.order}] ${r.title}  ->  ${r.fileUrl || '(no file)'}`));

  const orders = after.map(r => r.order);
  const dupes = orders.filter((o, i) => orders.indexOf(o) !== i);
  if (dupes.length) console.log(`\nWARNING: duplicate order values still present: ${[...new Set(dupes)].join(', ')}`);

  await mongoose.disconnect();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
