/**
 * International reciprocity and mutual-recognition agreements.
 *
 * Single source of truth: the Reciprocity page renders the list and the Home
 * page's hero tile counts it. They previously disagreed — the tile claimed "15+"
 * against a list of twelve — which is exactly what a second copy of a number
 * buys you. Add or remove an agreement here and both surfaces follow.
 */

export const agreements = [
  {
    body: 'Royal Institution of Chartered Surveyors (RICS)',
    country: 'United Kingdom', year: '2005', flag: '🇬🇧',
    desc: 'Full reciprocity for FNIQS members to attain MRICS status through an assessment of professional competence.',
  },
  {
    body: 'Australian Institute of Quantity Surveyors (AIQS)',
    country: 'Australia', year: '2012', flag: '🇦🇺',
    desc: 'Mutual recognition agreement enabling members to practice in either jurisdiction subject to local requirements.',
  },
  {
    body: 'Singapore Institute of Surveyors and Valuers (SISV)',
    country: 'Singapore', year: '2015', flag: '🇸🇬',
    desc: 'Professional reciprocity covering quantity surveying practice and professional development.',
  },
  {
    body: 'Ghana Institution of Surveyors (GhIS)',
    country: 'Ghana', year: '2008', flag: '🇬🇭',
    desc: 'Bilateral agreement for mutual recognition of professional qualifications within West Africa.',
  },
  {
    body: 'Institute of Quantity Surveyors of Kenya (IQSK)',
    country: 'Kenya', year: '2010', flag: '🇰🇪',
    desc: 'East-West African partnership for professional exchange and standards harmonisation.',
  },
  {
    body: 'Association of South African Quantity Surveyors (ASAQS)',
    country: 'South Africa', year: '2014', flag: '🇿🇦',
    desc: 'Reciprocity for qualified members to practice across both countries.',
  },
  {
    body: 'Hong Kong Institute of Surveyors (HKIS)',
    country: 'Hong Kong', year: '2017', flag: '🇭🇰',
    desc: 'Agreement covering professional recognition and collaborative research initiatives.',
  },
  {
    body: 'Chartered Institute of Building (CIOB)',
    country: 'United Kingdom', year: '2019', flag: '🇬🇧',
    desc: 'MoU for joint CPD programmes and shared professional development resources.',
  },
  {
    body: 'Pacific Association of Quantity Surveyors (PAQS)',
    country: 'International', year: '2016', flag: '🌏',
    desc: 'Membership in the Pacific rim QS alliance for international collaboration.',
  },
  {
    body: 'International Cost Engineering Council (ICEC)',
    country: 'International', year: '2003', flag: '🌐',
    desc: 'Affiliation with the global body for cost engineering and quantity surveying.',
  },
  {
    body: 'New Zealand Institute of Quantity Surveyors (NZIQS)',
    country: 'New Zealand', year: '2018', flag: '🇳🇿',
    desc: 'Mutual recognition and professional exchange framework.',
  },
  {
    body: 'Canadian Institute of Quantity Surveyors (CIQS)',
    country: 'Canada', year: '2021', flag: '🇨🇦',
    desc: 'Partnership for professional development and knowledge sharing.',
  },
];

export const AGREEMENT_COUNT = agreements.length;
