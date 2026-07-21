/**
 * Seeds the President's inaugural speech (delivered November 22, 2025) into
 * the singleton President record. Only $sets the speech fields — the rest of
 * the profile (name, photo, message paragraphs) is left untouched.
 *
 * Source: "PRESIDENT INAUGURAL SPEECH.pdf" from the NIQS secretariat
 * (WhatsApp, July 2026). Text cleaned of PDF extraction artifacts.
 *
 * Usage (from the server folder):
 *   node scripts/seedPresidentSpeech.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const President = require('../models/President');

const speechTitle = 'Acceptance Speech & Proposed Programmes for the NIQS NEC (2025 – 2027)';
const speechSubtitle =
  'Delivered by QS Dr. Aminu M. Bashir, FNIQS — President, Nigerian Institute of Quantity Surveyors · November 22, 2025';

const speechBody = `Gratitude to Allah, my parents, family and friends, Past Presidents, elders and leaders in the profession, sponsoring organisations and other professional colleagues.

In line with my manifesto, and with due regard to the exigencies of our time, below are the priority programmes for the 2025 – 2027 NEC under my leadership.

1. ADVOCACY TO GOVERNMENT MDAs, CORPORATE ORGANISATIONS & STAKEHOLDERS IN THE INDUSTRY
Develop a coordinated advocacy, collaboration and marketing strategy that projects the NIQS brand across major Government MDAs, regulators and corporate organisations, ensuring consistent visibility and unlocking employment and consultancy opportunities for members in both public and private organisations.

2. CAPACITY DEVELOPMENT AND TRAINING IN SECTOR/SUBJECT AREAS
Intensive training of our members by developing sector-specific training pathways to enhance their proficiency in Cost Management of MEP/HVAC, Highways & Rail Infrastructure, Marine & Coastal Works, and Oil & Gas. Execute MoUs with specialist firms for internships of our YQSF members across the country.

3. INCREASED INVESTMENT PORTFOLIO / ASSET BASE
In line with the resolution of our AGM, we shall increase our asset base by investing in landed properties and projects that will generate streams of income for our Institute in an economically viable location with appreciable value.

4. REVITALISATION OF THE SECRETARIAT'S HUMAN, IT & ENERGY RESOURCES
This shall involve a secretariat audit to review the precise needs of the Institute via recruitment to fill vacant offices, digitalisation of all the Institute's operations to provide monthly secretariat updates, a unified NIQS Member Portal and a policy consultation portal on the NIQS website. Provision of alternative solar energy for reduction in the running costs of the Secretariat.

5. CONSTITUTION REVIEW CONSULTATIVE COMMITTEE (CRCC)
The NEC will constitute a CRCC with membership from the various geopolitical zones of the country to consult members and receive input on aspects of the NIQS Constitution that need to be reviewed. This is to ensure inclusiveness, sensitivity in our diversity, technological advancements, modern and proven approaches to corporate governance, and sustainable growth for the Institute and its esteemed members.

6. REVIEW OF OUR STRATEGIC ACTION PLAN & OTHER CORPORATE DOCUMENTS
We shall conclude the review of the Strategic Action Plan and consider other corporate documents in the light of best international practices, the changing needs of the industry and market expectations.

7. RENAISSANCE AND SUSTAINING THE REBRANDING AGENDA
Revive and consolidate the gains of our rebranding project by aligning all marketing and corporate affairs initiatives with the Institute's reviewed Strategic Action Plan, ensuring continuity, professionalism and long-term visibility.

8. ACTUALISATION OF THE INSTITUTE'S COST DATA BANK PROJECT
The Cost Data Bank project initiated by past administrations of the Institute will be reinvigorated, funded and fully supported to actualisation. This will aid cost planning, budgeting and monitoring of capital projects by end-users.

9. COLLABORATION WITH THE QS ACADEMY FOR BESPOKE TRAINING & CREATION OF AN INTER-GENERATIONAL QS KNOWLEDGE ALLIANCE
The Academy will be supported to provide bespoke training modules for members and other interest groups, with specialisation in various competencies such as digital cost management, data analytics, and sustainability & green buildings (carbon assessment & energy audit). This will further boost the revenue base of the Institute.

10. NIQS PRESIDENT'S AWARD FOR BEST GRADUATING STUDENTS
To enhance visibility and marketing, and to attract the best talents into the profession, the Institute will introduce an award for the Best Graduating QS Student in tertiary institutions across the six geopolitical zones of the country.

11. SPONSORSHIP OF PUBLICATIONS IN REPUTABLE JOURNALS / SUPPORT TO CONFERENCES
We shall support and encourage our members in academia in the publication of articles in high-impact international journals, and attendance of conferences to present ground-breaking research in various subject areas of the profession.

12. EXPLORE MORE RECIPROCITY AGREEMENTS & EXPORT QS TALENTS
Explore new reciprocity agreements and leverage all existing ones to export QS talents, thereby creating more job opportunities and foreign-exchange earnings for the country.

13. SUSTAINED RECOGNITION AND APPRECIATION OF THE EFFORTS OF OUR PAST LEADERS & ELDERS
We shall continuously engage, appreciate and recognise our past leaders and elders at various levels of the Institute for their services and contribution to the Institute. This will provide lessons learnt from history for charting a better tomorrow.

Appreciation of the contributions of Past Presidents and the Incorporated Trustees in bringing the Institute to its present state. Special and invaluable thanks to the IPP, QS Kene C. Nzekwe FNIQS; special guests (the DSP and H.E. the Governor of Kano State); MHORs QS Yusuf Umar Datti and the Rt. Hon. Speaker JGSHA; the investiture speaker; the chairman of the occasion, HRH Turakin Ringim; Chairman HNLCA & Board Member TETFund, Alh. Turaki Ibrahim; IPP WFEAO, Engr. M. B. Shehu FNSE; QS Humphrey Amegadoe GHIS; seniors in the profession; distinguished colleagues; esteemed friends from far and near; my invaluable students; well-wishers; and my dearest family members.

Thank you, and God bless NIQS. God bless the Federal Republic of Nigeria.`;

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const res = await President.findOneAndUpdate(
      { _singleton: 'president' },
      { $set: { speechTitle, speechSubtitle, speechBody } },
      { new: true, upsert: true }
    );
    console.log('Speech seeded on President record:', res._id.toString());
    console.log('Title:', res.speechTitle);
    console.log('Body length:', res.speechBody.length, 'chars');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
