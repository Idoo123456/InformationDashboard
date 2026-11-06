import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('manual_book', 'screenshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureExtra() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // 1. Capture FKIP TV Display
    console.log('Capturing Faculty TV Display (FKIP)...');
    await page.goto('http://localhost:5173/fkip/tv', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '14_faculty_tv_fkip.png') });

    // 2. Login to admin
    console.log('Logging in to capture Schedule Modal...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => sleep(2000))
    ]);
    await sleep(1500);

    // Navigate to Jadwal Kegiatan
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.admin-nav .nav-btn'));
      const target = buttons.find(b => b.textContent.toLowerCase().includes('jadwal kegiatan'));
      if (target) target.click();
    });
    await sleep(1500);

    // Click "Entri Baru" button
    console.log('Clicking Entri Baru...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.textContent.includes('Entri Baru'));
      if (addBtn) addBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_schedule_modal.png') });
    console.log('Schedule modal captured!');

    // Close modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.modal-close-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Batal'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(1000);

    // Switch schedule view to "Kalender"
    console.log('Capturing Calendar View...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const calBtn = buttons.find(b => b.textContent.includes('Kalender'));
      if (calBtn) calBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06b_schedule_calendar_view.png') });

    // Switch schedule view to "Kanvas" (Kanban Grid)
    console.log('Capturing Canvas/Grid View...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const kanvasBtn = buttons.find(b => b.textContent.includes('Kanvas'));
      if (kanvasBtn) kanvasBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06c_schedule_kanvas_view.png') });

  } catch (err) {
    console.error('Error during captureExtra:', err);
  } finally {
    await browser.close();
  }
}

captureExtra();

