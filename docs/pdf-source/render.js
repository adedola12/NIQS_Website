// Render a branded HTML document to PDF using the installed Chrome.
// Usage: node render.js [input.html] [output.pdf] ["footer title"]
// With no args it builds the Portal API requirements PDF (default).
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const HERE = __dirname;
const REPO = path.resolve(HERE, '..', '..');
const LOGO = path.join(REPO, 'client', 'public', 'NIQS-LOGO-PNG-NAV.png');

const argv = process.argv.slice(2);
const HTML = argv[0] ? path.resolve(argv[0]) : path.join(HERE, 'portal-api-requirements.html');
const OUT  = argv[1] ? path.resolve(argv[1]) : path.join(REPO, 'docs', 'NIQS-Portal-API-Integration-Requirements.pdf');
const FOOTER_TITLE = argv[2] || 'Membership Portal — API Integration Requirements';

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
      <span>${FOOTER_TITLE}</span>
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
