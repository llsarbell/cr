import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USER_DATA_DIR = join(__dirname, 'chrome-profile');
const OUTPUT_DIR = join(__dirname, 'screenshots');

try { mkdirSync(OUTPUT_DIR, { recursive: true }); } catch (err) {}

// === СТРАТЕГИЯ PIF (2 скрина для финальных 13 индикаторов) ===
// T: tv_pif_13 (Warn), tv_pif_16 (MFI)
const CHARTS_CONFIG = [
    { filename: 'tv_pif_13_1d_warn.png', url: 'https://www.tradingview.com/chart/H2iw7QuE/' },
    { filename: 'tv_pif_16_1d_mfi.png',  url: 'https://www.tradingview.com/chart/NmBQlMHI/' }
];

const DEFAULT_DELAY = 3000;
const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log(`Начинаем обработку ${CHARTS_CONFIG.length} графиков TradingView PIF...`);

    const browser = await puppeteer.launch({
        headless: "new",
        userDataDir: USER_DATA_DIR,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,1200', '--disable-blink-features=AutomationControlled'],
        ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

    let count = 0;
    for (const chart of CHARTS_CONFIG) {
        try {
            console.log(`\n[${++count}/${CHARTS_CONFIG.length}] Открываем: ${chart.filename}`);
            await page.goto(chart.url, { waitUntil: 'networkidle2', timeout: 60000 });

            const waitTime = chart.delay || DEFAULT_DELAY;
            await delay(waitTime);

            const element = await page.$('.layout__area--center');
            if (element) {
                await element.screenshot({ path: join(OUTPUT_DIR, chart.filename) });
                console.log(`   Сохранено`);
            } else {
                await page.screenshot({ path: join(OUTPUT_DIR, chart.filename) });
                console.log(`   Сохранено (Full Page)`);
            }
        } catch (e) { console.error(`   Ошибка: ${e.message}`); }
    }
    console.log(`\nГотово!`);
    await browser.close();
})();
