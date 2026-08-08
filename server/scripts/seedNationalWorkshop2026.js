/**
 * Publishes the 2026 National Workshop & Induction to the events calendar, with a
 * Flyer Studio design attached to each sitting.
 *
 * The workshop runs twice — online 18-20 August and physically 25-27 August — so
 * it is seeded as two events rather than one. A single record spanning 18-27
 * August would draw a ten-day block across a calendar week when nothing happens,
 * and a member looking for "when is the online one" would have to read the body
 * text to find out. Two records put each sitting on the right days and let the
 * flyer for each state its own venue.
 *
 * Both carry the same theme, CPD award and registration form, so they read as one
 * programme.
 *
 * Faculty are the four who taught the May 2026 training, carried over on the
 * Secretariat's instruction. Read from that event's own record rather than from
 * the Flyer Studio defaults, so anything attached to them there — photographs
 * included — comes with them. None currently carries a photograph; the flyer
 * renders name cards, which is how the May flyer already publishes.
 *
 * Their subjects line up with this theme rather than merely being available:
 * highways, MEP and project management are three of the four topics and the three
 * the theme names, so they are ordered to match the theme's own wording, with the
 * digital-measurement session last.
 *
 * Idempotent: matches on title, so re-running updates rather than duplicates.
 *
 * Usage (from the server folder):
 *   node scripts/seedNationalWorkshop2026.js [--apply]
 *
 * Without --apply it reports what it would write and changes nothing.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Admin = require('../models/Admin');

const APPLY = process.argv.includes('--apply');

const THEME =
  'Bridging the Gaps in Infrastructure Development: Harmonising Cost Dynamics in '
  + 'Highways, MEP & Project Management';

const REGISTRATION = 'https://forms.gle/uGM8izsv6gVJB4Ku5';
const ENQUIRIES = ['08091551476', '08166916162'];

/* Fees as supplied by the Secretariat, in naira. Rendered into the description
   rather than the flyer: the flyer template has no fee table, and seven rows of
   pricing would not fit its registration strip legibly. */
const FEES = [
  ['Fellow', '80,000'],
  ['Member', '70,000'],
  ['Probationer', '60,000'],
  ['Quantity Surveying Lecturer', '50,000'],
  ['Student (registered with NIQS)', '30,000'],
  ['Student (not registered with NIQS)', '40,000'],
  ['Non-member', '150,000'],
];

const feeLines = FEES.map(([k, v]) => `  ${k} — ₦${v}`).join('\n');

const describe = (mode, when, where) =>
  `${THEME}\n\n`
  + `${mode} sitting: ${when}. ${where}\n\n`
  + 'Awards 27 CPD points. Open to students, probationers, members, fellows and '
  + 'non-members.\n\n'
  + `Training cost per category:\n${feeLines}\n\n`
  + `Register: ${REGISTRATION}\n`
  + 'Enquiries: info@niqs.org.ng · 0809 155 1476 · 0816 691 6162';

/* Shared Flyer Studio design. Per-sitting fields are merged in below. */
const flyerBase = {
  category: 'Training',
  layout: 'Left',
  theme: 'Dark',
  title: 'National Workshop & Induction',
  subtitle: THEME,
  goldWordIndex: 2,          // highlights "&" through to Induction
  time: '9:00 AM daily',
  timeZone: 'WAT',
  cpdPoints: 27,
  cpdSealVariant: 'auto',
  registrationUrl: REGISTRATION,
  registrationExtra: 'Open to students, probationers, members, fellows & non-members',
  enquiries: ENQUIRIES,
  backgroundId: 'dark-bg-1',
  accent: 'glow',
  selectedSpeakerIndex: 0,
  schedule: '',
  /* Ordered to echo the theme — "Highways, MEP & Project Management" — rather
     than left in the May running order, so a reader scanning the flyer meets the
     subjects in the sequence the title just promised them. */
  speakers: [
    { id: '1', name: 'QS Muftau Akinpelu', credentials: '', photo: null, role: 'Faculty',
      topic: 'Highway infrastructure cost management' },
    { id: '2', name: 'QS Prof Ganiyu Amuda-Yusuf', credentials: '', photo: null, role: 'Faculty',
      topic: 'Mechanical, electrical & plumbing services' },
    { id: '3', name: 'QS Prof Kulomri Adogbo', credentials: '', photo: null, role: 'Faculty',
      topic: 'Project management & resource controls' },
    { id: '4', name: 'QS Dr Aminu M. Bashir', credentials: '', photo: null, role: 'Faculty',
      topic: 'Digital measurement workflows & BIM' },
  ],
  sections: {
    cpdSeal: true,
    subtitle: true,
    themedEyebrow: true,
    speakers: true,
    presentersEyebrow: true,
    metaBlock: true,
    metaDate: true,
    metaVenue: true,
    metaPlatform: true,
    registration: true,
    contactBar: true,
  },
};

const EVENTS = [
  {
    title: 'National Workshop & Induction 2026 — Online',
    date: new Date('2026-08-18T09:00:00+01:00'),
    endDate: new Date('2026-08-20T17:00:00+01:00'),
    location: 'Online',
    venue: 'Zoom',
    description: describe('Online', '18-20 August 2026', 'Joining link sent to registrants by email.'),
    flyer: {
      ...flyerBase,
      dateStart: '2026-08-18',
      dateEnd: '2026-08-20',
      venueType: 'Virtual',
      venuePhysical: '',
      venueCity: '',
      platform: 'Zoom',
      platformNote: 'Link via email',
    },
  },
  {
    title: 'National Workshop & Induction 2026 — Physical',
    date: new Date('2026-08-25T09:00:00+01:00'),
    endDate: new Date('2026-08-27T17:00:00+01:00'),
    location: 'Jabi, Abuja',
    venue: 'Nile University of Nigeria',
    description: describe('Physical', '25-27 August 2026', 'Venue: Nile University of Nigeria, Jabi, Abuja.'),
    flyer: {
      ...flyerBase,
      dateStart: '2026-08-25',
      dateEnd: '2026-08-27',
      venueType: 'In-Person',
      venuePhysical: 'Nile University of Nigeria',
      venueCity: 'Jabi, Abuja',
      platform: '',
      platformNote: '',
    },
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });

  const author = await Admin.findOne({}, '_id email').lean();
  if (!author) throw new Error('no Admin on record to author the events with');

  console.log(`author: ${author.email || author._id}\n`);

  for (const e of EVENTS) {
    const existing = await Event.findOne({ title: e.title }, '_id').lean();
    console.log(`-- ${e.title} --`);
    console.log(`   ${e.date.toISOString().slice(0, 10)} to ${e.endDate.toISOString().slice(0, 10)}`);
    console.log(`   ${e.venue}${e.location ? ', ' + e.location : ''}`);
    console.log(`   ${existing ? 'exists — would update' : 'new — would create'}`);

    if (!APPLY) continue;

    await Event.findOneAndUpdate(
      { title: e.title },
      {
        ...e,
        type: 'workshop',
        scope: 'national',
        isFeatured: true,
        registrationLink: REGISTRATION,
        hasFlyer: true,
        author: author._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log('   written');
  }

  if (!APPLY) console.log('\ndry run — pass --apply to write.');
  else {
    const total = await Event.countDocuments();
    console.log(`\ndone — ${total} events on record.`);
  }
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
