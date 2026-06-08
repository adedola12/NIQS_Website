/**
 * Flyer category configuration — single source of truth.
 *
 * The Flyer Studio started as a CPD tool (Training / Webinar) but now also covers
 * institutional occasions: NEC courtesy visits, appreciation, congratulations and
 * condolence flyers. Those are *awareness* flyers — no CPD seal, no module
 * breakdown, no registration QR. Rather than scatter `category === 'Webinar'`
 * checks across the renderer and the form, every category-specific behaviour lives
 * here and both `MainFlyerLeftDark` and `AdminForm` read from `getCategoryConfig`.
 *
 * Fields:
 *   isCpd          — CPD event? drives the CPD seal, points field, "CPD" framing
 *   badge          — header pill text (top-right)
 *   eyebrow        — themed eyebrow above the title
 *   peopleLabel    — eyebrow over the people band (FACULTY / VISITING DELEGATION …)
 *   peopleNoun     — singular noun for a person card / the people section header
 *   peopleRoles    — role dropdown options for each person card
 *   defaultRole    — role applied to a newly-added person
 *   showRegistration — show the registration URL field + QR block
 *   showHost       — show the "Host / where visiting" field + a HOST meta cell
 *   hostLabel      — label for the HOST meta cell
 *   showMessage    — show the free-text message/citation field (appreciation etc.)
 *   messageLabel   — label for that field
 *   heroLine1/2    — two-line hero for the "Thank You"-style closing view
 *   citationEyebrow— eyebrow on the single-person spotlight view
 *   deliverables   — ordered list of sub-deliverable views this category offers
 *   itineraryEyebrow — eyebrow on the itinerary / programme view
 *   scheduleLabel  — form label for the itinerary/programme textarea (event.schedule)
 *   schedulePlaceholder — example itinerary text for the form
 *   tone           — 'brand' (gold accents) | 'sombre' (muted, for condolence)
 *   packId         — short code shown in the form's "Pack" readout
 *   tabs           — category-appropriate labels keyed by sub-deliverable
 */

export const CATEGORIES = [
  'Training',
  'Webinar',
  'Courtesy Visit',
  'Appreciation',
  'Congratulations',
  'Condolence',
]

// Full CPD view set (Training adds 'itinerary' for the module breakdown).
const CPD_TABS = {
  noSpeakers: 'No Speakers', main: 'Speakers', itinerary: 'Modules', countdown: 'Countdown',
  speakerCitation: 'Citation', thankYou: 'Thank You',
}

const BASE = {
  isCpd: false,
  badge: 'NIQS',
  eyebrow: 'NIQS',
  peopleLabel: 'PRESENTERS',
  peopleNoun: 'Person',
  peopleRoles: ['Faculty', 'Presenter', 'Keynote', 'Host', 'Panelist'],
  defaultRole: 'Presenter',
  showRegistration: false,
  showHost: false,
  hostLabel: 'VENUE',
  showMessage: false,
  messageLabel: 'Message',
  heroLine1: 'Thank you',
  heroLine2: 'for coming!',
  citationEyebrow: 'MEET THE SPEAKERS',
  // Occasion default: announcement → people → programme → countdown → spotlight → closing
  deliverables: ['noSpeakers', 'main', 'itinerary', 'countdown', 'speakerCitation', 'thankYou'],
  itineraryEyebrow: 'PROGRAMME OF EVENTS',
  scheduleLabel: 'Programme of events',
  schedulePlaceholder: '10:00 AM — Arrival & opening\n11:00 AM — Main programme\n1:00 PM — Closing & refreshments',
  tone: 'brand',
  packId: 'X',
  tabs: {
    noSpeakers: 'Announcement', main: 'People', itinerary: 'Programme', countdown: 'Countdown',
    speakerCitation: 'Spotlight', thankYou: 'Recap',
  },
}

export const CATEGORY_CONFIG = {
  Training: {
    ...BASE,
    isCpd: true,
    badge: 'TRAINING',
    eyebrow: 'CPD TRAINING',
    peopleLabel: 'FACULTY',
    peopleNoun: 'Speaker',
    peopleRoles: ['Faculty', 'Presenter', 'Keynote', 'Host', 'Panelist'],
    defaultRole: 'Faculty',
    showRegistration: true,
    citationEyebrow: 'MEET THE FACULTY',
    deliverables: ['noSpeakers', 'main', 'itinerary', 'countdown', 'speakerCitation', 'thankYou'],
    itineraryEyebrow: 'TRAINING MODULES',
    scheduleLabel: 'Module Breakdown',
    schedulePlaceholder: 'Day 1: Introduction to Digital Workflows\nDay 2: BIM & Quantity Surveying\nDay 3: Practical Sessions',
    packId: 'T',
    tabs: CPD_TABS,
  },
  Webinar: {
    ...BASE,
    isCpd: true,
    badge: 'WEBINAR',
    eyebrow: 'WEBINAR SERIES',
    peopleLabel: 'PRESENTERS',
    peopleNoun: 'Speaker',
    defaultRole: 'Presenter',
    showRegistration: true,
    citationEyebrow: 'MEET THE SPEAKERS',
    // Webinars run online — no on-flyer itinerary view.
    deliverables: ['noSpeakers', 'main', 'countdown', 'speakerCitation', 'thankYou'],
    packId: 'W',
    tabs: { noSpeakers: 'No Speakers', main: 'Speakers', countdown: 'Countdown', speakerCitation: 'Citation', thankYou: 'Thank You' },
  },
  'Courtesy Visit': {
    ...BASE,
    badge: 'COURTESY VISIT',
    eyebrow: 'COURTESY VISIT',
    peopleLabel: 'VISITING DELEGATION',
    peopleNoun: 'Delegate',
    peopleRoles: ['NEC Member', 'President', 'Vice President', 'Official', 'Delegation'],
    defaultRole: 'NEC Member',
    showHost: true,
    hostLabel: 'VISITING',
    heroLine1: 'Thank you',
    heroLine2: 'for hosting us!',
    citationEyebrow: 'THE DELEGATION',
    itineraryEyebrow: 'VISIT ITINERARY',
    scheduleLabel: 'Visit itinerary',
    schedulePlaceholder: '10:00 AM — Arrival & reception at the Secretariat\n10:30 AM — Welcome address\n11:00 AM — Tour & remarks\n12:30 PM — Group photograph & departure',
    packId: 'CV',
    tabs: { noSpeakers: 'Announcement', main: 'Delegation', itinerary: 'Itinerary', countdown: 'Countdown', speakerCitation: 'Spotlight', thankYou: 'Recap' },
  },
  Appreciation: {
    ...BASE,
    badge: 'APPRECIATION',
    eyebrow: 'IN APPRECIATION',
    peopleLabel: 'IN APPRECIATION OF',
    peopleNoun: 'Honoree',
    peopleRoles: ['Honoree', 'Recipient', 'Awardee', 'Partner', 'Sponsor'],
    defaultRole: 'Honoree',
    showMessage: true,
    messageLabel: 'Appreciation message',
    heroLine1: 'With',
    heroLine2: 'appreciation',
    citationEyebrow: 'IN APPRECIATION OF',
    itineraryEyebrow: 'PROGRAMME OF EVENTS',
    scheduleLabel: 'Programme of events',
    packId: 'AP',
    tabs: { noSpeakers: 'Announcement', main: 'Honorees', itinerary: 'Programme', countdown: 'Countdown', speakerCitation: 'Honoree', thankYou: 'Appreciation' },
  },
  Congratulations: {
    ...BASE,
    badge: 'CONGRATULATIONS',
    eyebrow: 'CONGRATULATIONS',
    peopleLabel: 'CELEBRATING',
    peopleNoun: 'Celebrant',
    peopleRoles: ['Celebrant', 'Awardee', 'Inductee', 'Fellow', 'President'],
    defaultRole: 'Celebrant',
    showMessage: true,
    messageLabel: 'Congratulatory message',
    heroLine1: 'Hearty',
    heroLine2: 'congratulations',
    citationEyebrow: 'CELEBRATING',
    itineraryEyebrow: 'PROGRAMME OF EVENTS',
    scheduleLabel: 'Programme of events',
    packId: 'CG',
    tabs: { noSpeakers: 'Announcement', main: 'Celebrants', itinerary: 'Programme', countdown: 'Countdown', speakerCitation: 'Celebrant', thankYou: 'Message' },
  },
  Condolence: {
    ...BASE,
    badge: 'TRIBUTE',
    eyebrow: 'IN MEMORIAM',
    peopleLabel: 'IN MEMORY OF',
    peopleNoun: 'Tribute',
    peopleRoles: ['Late', 'Past President', 'Fellow', 'Member'],
    defaultRole: 'Late',
    showMessage: true,
    messageLabel: 'Tribute message',
    heroLine1: 'In loving',
    heroLine2: 'memory',
    citationEyebrow: 'IN MEMORY OF',
    itineraryEyebrow: 'FUNERAL ARRANGEMENTS',
    scheduleLabel: 'Funeral arrangements',
    schedulePlaceholder: 'Service of Songs — Fri 12 Jun, 4:00 PM\nLying-in-State — Sat 13 Jun, 9:00 AM\nFuneral Service — Sat 13 Jun, 10:00 AM\nInterment — Sat 13 Jun, 12:00 PM',
    tone: 'sombre',
    packId: 'CD',
    tabs: { noSpeakers: 'Announcement', main: 'Tribute', itinerary: 'Arrangements', countdown: 'Countdown', speakerCitation: 'Portrait', thankYou: 'Tribute' },
  },
}

export function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Training
}

/** Does this category offer the itinerary / programme view? */
export function hasItinerary(category) {
  return getCategoryConfig(category).deliverables.includes('itinerary')
}
