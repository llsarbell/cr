import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Сохраняем сразу в папку репозитория
const OUTPUT_DIR = join(__dirname, 'screenshots');

const chartConfig = {
  url: 'https://www.tradingview.com/chart/Q1AQBZrq/',
  filename: 'tw_cf_01_1d_div_all_rsi.png',
  panelSelector: '.layout__area--center'
};

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new', // ВКЛЮЧЕН ФОНОВЫЙ РЕЖИМ
    userDataDir: join(__dirname, 'chrome-profile'),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1200,1200',
      // Маскировка под обычного пользователя
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ],
    ignoreDefaultArgs: ['--enable-automation']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 1 });

  console.log(`Открываем ${chartConfig.url}...`);
  await page.goto(chartConfig.url, { waitUntil: 'networkidle2', timeout: 90000 });

  // Скрытие лишнего UI
  await page.evaluate(() => {
    const header = document.querySelector('header');
    if (header) header.style.display = 'none';
    ['.layout__area--left', '.layout__area--right', '.layout__area--bottom'].forEach(sel => {
      const el = document.querySelector(sel); if(el) el.style.display = 'none';
    });
    const watermarks = document.querySelectorAll('[data-name="watermark"]');
    watermarks.forEach(el => el.style.display = 'none');
  });
  
  await delay(2000);
  await page.waitForSelector(chartConfig.panelSelector, { timeout: 20000 });

  // Скрытие перекрестия
  const tvLogoSelector = '.tv-control-logo';
  const logoSelector = 'a[href="/"] svg';
  try {
    if (await page.$(tvLogoSelector)) await page.hover(tvLogoSelector);
    else if (await page.$(logoSelector)) await page.hover(logoSelector);
    else await page.mouse.move(20, 1000);
  } catch (e) {
    await page.mouse.move(20, 1000);
  }
  await delay(800);

  const panelElement = await page.$(chartConfig.panelSelector);
  if (panelElement) {
    const filepath = join(OUTPUT_DIR, chartConfig.filename);
    await panelElement.screenshot({ path: filepath, type: 'png', omitBackground: false });
    console.log(`✓ Сохранено: ${chartConfig.filename}`);
  } else {
    console.warn('❌ Панель не найдена!');
  }

  await browser.close();
})();
