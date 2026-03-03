const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const htmlPath = path.join(__dirname, 'presentation.html');
  const pdfPath = path.join(__dirname, 'ClawCart-Deck.pdf');
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/home/coder/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  console.log('Loading presentation...');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  
  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    width: '1280px',
    height: '720px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  
  await browser.close();
  console.log(`PDF saved to: ${pdfPath}`);
})();
