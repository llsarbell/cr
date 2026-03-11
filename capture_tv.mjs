import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USER_DATA_DIR = join(__dirname, 'chrome-profile');
const OUTPUT_DIR = join(__dirname, 'screenshots');

try { mkdirSync(OUTPUT_DIR, { recursive: true }); } catch (err) {}

// === СПИСОК ГРАФИКОВ TradingView CF (4 скрина для финальных 13 индикаторов) ===
// P: tv_cf_01 | T: tv_cf_12, tv_cf_13, tv_cf_14
const CHARTS_CONFIG = [
    { filename: 'tv_cf_01_1d_div_all.png',   url: 'https://www.tradingview.com/chart/DeeS34sy/' },
    { filename: 'tv_cf_12_1d_angle_7.png',   url: 'https://www.tradingview.com/chart/bMXvYCVF/' },
    { filename: 'tv_cf_13_1d_alma_lvl.png',  url: 'https://www.tradingview.com/chart/XV0L73xp/' },
    { filename: 'tv_cf_14_1d_ago.png',       url: 'https://www.tradingview.com/chart/jsmvbxBi/' }
];

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log(`Начинаем обработку ${CHARTS_CONFIG.length} графиков TradingView CF...`);

    const browser = await puppeteer.launch({
        headless: "new",
        userDataDir: USER_DATA_DIR,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1200,1200',
            '--disable-blink-features=AutomationControlled'
        ],
        ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

    let count = 0;

    for (const chart of CHARTS_CONFIG) {
        try {
            console.log(`\n[${++count}/${CHARTS_CONFIG.length}] Открываем: ${chart.filename}`);

            await page.goto(chart.url, { waitUntil: 'networkidle2', timeout: 60000 });
            await delay(2500);

            const element = await page.$('.layout__area--center');

            if (element) {
                await element.screenshot({ path: join(OUTPUT_DIR, chart.filename) });
                console.log(`   Сохранено`);
            } else {
                await page.screenshot({ path: join(OUTPUT_DIR, chart.filename) });
                console.log(`   Сохранено (Full Page) - селектор не найден`);
            }

        } catch (e) {
            console.error(`   Ошибка: ${e.message}`);
        }
    }

    console.log(`\nГотово!`);
    await browser.close();
})();
