// Render the API-requirements HTML to a branded PDF using the installed Chrome.
// Usage: node render.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const HERE = __dirname;
const REPO = path.resolve(HERE, '..', '..');
const HTML = path.join(HERE, 'portal-api-requirements.html');
const LOGO = path.join(REPO, 'client', 'public', 'NIQS-LOGO-PNG-NAV.png');
const OUT  = path.join(REPO, 'docs', 'NIQS-Portal-API-Integration-Requirements.pdf');

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const chrome = CHROME_CANDIDATES.find(p => fs.existsSync(p));
if (!chrome) { console.error('No Chrome/Edge found'); process.exit(1); }

(async () => {
  let html = fs.readFileSync(HTML, 'utf8');
  const logo = fs.readFileSync(LOGO).toString('base64');
  html = html.replace('__LOGO_DATA_URI__', `data:image/png;base64,${logo}`);

  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const footer = `
    <div style="width:100%; font-family:'Segoe UI',Arial,sans-serif; font-size:7pt; color:#9aa3b2;
                padding:0 14mm; display:flex; justify-content:space-between; align-items:center;">
      <span style="color:#0B1F4B; font-weight:700;">NIQS &times; ADLM</span>
      <span>Membership Portal — API Integration Requirements</span>
      <span>Confidential &nbsp;·&nbsp; Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>`;

  await page.pdf({
    path: OUT,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: footer,
    margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
  });

  await browser.close();
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`OK → ${OUT} (${kb} KB)`);
})().catch(e => { console.error(e); process.exit(1); });
