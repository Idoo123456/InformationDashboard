import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('manual_book', 'screenshots');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // 1. Screenshot TV Display Layar Penuh (Public Signage)
    console.log('Capturing TV Display...');
    await page.goto('http://localhost:5173/tv', { waitUntil: 'networkidle2' });
    await sleep(2500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_tv_display.png') });

    // 2. Screenshot Login Page
    console.log('Capturing Login Page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_login_page.png') });

    // 3. Do Login
    console.log('Logging in...');
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'admin123');
    await sleep(500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02b_login_filled.png') });

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => sleep(2000))
    ]);
    await sleep(2000);

    // 4. Admin Overview Tab
    console.log('Capturing Admin Overview...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_admin_overview.png') });

    // Helper function to click sidebar navigation button
    async function clickTab(tabName) {
      const clicked = await page.evaluate((name) => {
        const buttons = Array.from(document.querySelectorAll('.admin-nav .nav-btn'));
        const target = buttons.find(b => b.textContent.toLowerCase().includes(name.toLowerCase()));
        if (target) {
          target.click();
          return true;
        }
        return false;
      }, tabName);
      await sleep(1500);
      return clicked;
    }

    // 5. Settings Tab
    console.log('Capturing Settings Tab...');
    await clickTab('Pengaturan Umum');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_settings_tab.png') });

    // 6. Slides Tab
    console.log('Capturing Slides Tab...');
    await clickTab('Manajemen Slide');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_slides_tab.png') });

    // 7. Schedules Tab
    console.log('Capturing Schedules Tab...');
    await clickTab('Jadwal Kegiatan');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_schedules_tab.png') });

    // Open Schedule Modal (Tambah Jadwal)
    console.log('Capturing Schedule Modal...');
    const openedModal = await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button'));
      const btn = addBtns.find(b => b.textContent.includes('Tambah Jadwal') || b.textContent.includes('Tambah Agenda'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (openedModal) {
      await sleep(1200);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '07_schedule_modal.png') });
      // Close modal
      await page.evaluate(() => {
        const closeBtn = document.querySelector('.modal-close-btn') || document.querySelector('button[aria-label="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Batal'));
        if (closeBtn) closeBtn.click();
      });
      await sleep(800);
    }

    // 8. Announcements Tab
    console.log('Capturing Announcements Tab...');
    await clickTab('Pengumuman');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_announcements_tab.png') });

    // 9. Reports Tab
    console.log('Capturing Reports Tab...');
    await clickTab('Laporan Agenda');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_reports_tab.png') });

    // 10. Room Manager Tab
    console.log('Capturing Room Manager Tab...');
    await clickTab('Master Ruangan');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '10_room_manager_tab.png') });

    // 11. TV Devices Manager Tab
    console.log('Capturing TV Devices Tab...');
    await clickTab('Kelola Perangkat TV');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '11_tv_devices_tab.png') });

    // 12. User Manager Tab
    console.log('Capturing User Manager Tab...');
    await clickTab('Manajemen Pengguna');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '12_user_manager_tab.png') });

    // 13. Activity Logs Tab
    console.log('Capturing Activity Logs Tab...');
    await clickTab('Log Aktivitas Kampus');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '13_activity_logs_tab.png') });

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();

