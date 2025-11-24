import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Используем наш общий профиль
const USER_DATA_DIR = join(__dirname, 'chrome-profile');

(async () => {
  console.log(`🚀 Запуск Chrome с профилем Puppeteer...`);
  console.log(`📂 Профиль: ${USER_DATA_DIR}`);

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: USER_DATA_DIR,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1280,1024',
      '--disable-blink-features=AutomationControlled'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });
  
  // Просто открываем Google или пустую страницу, дальше ты сам
  await page.goto('https://google.com', { waitUntil: 'networkidle2' });

  console.log('✅ Браузер открыт. Введи адрес сайта сам и логинься.');
  console.log('⏳ Жду 10 минут...');
  
  await new Promise(r => setTimeout(r, 600000));

  await browser.close();
})();
