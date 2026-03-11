import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USER_DATA_DIR = join(__dirname, 'chrome-profile');
const OUTPUT_DIR = join(__dirname, 'screenshots');

try { mkdirSync(OUTPUT_DIR, { recursive: true }); } catch (err) {}

const delay = ms => new Promise(r => setTimeout(r, ms));

// === CF: crypto-family.com (6 скринов) ===
const CF_CONFIG = [
    {
        name: 'BTC Magma Signals',
        canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(2) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30',
        timeframes: ['4h', '1d', '1w'],
        prefix: 'magma'
    },
    {
        name: 'BTC Long-Short CEX',
        canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(5) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30',
        timeframes: ['1d'],
        prefix: 'lscex'
    },
    {
        name: 'Trend RSI Bitcoin',
        canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(9) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30',
        timeframes: ['1d'],
        prefix: 'trendrsi_btc'
    },
    {
        name: 'Funding Rate',
        canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(10) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30',
        timeframes: ['1d'],
        prefix: 'funding'
    }
];

const CF_FILE_MAP = {
    magma_4h:        'cf_01_4h_magma.png',
    magma_1d:        'cf_02_1d_magma.png',
    magma_1w:        'cf_03_1w_magma.png',
    lscex_1d:        'cf_07_1d_cex_long_short.png',
    trendrsi_btc_1d: 'cf_10_1d_btc_trend_rsi.png',
    funding_1d:      'cf_13_1d_funding.png'
};

// === TV: TradingView (6 скринов) ===
const TV_CONFIG = [
    { filename: 'tv_cf_01_1d_div_all.png',  url: 'https://www.tradingview.com/chart/DeeS34sy/' },
    { filename: 'tv_cf_12_1d_angle_7.png',  url: 'https://www.tradingview.com/chart/bMXvYCVF/' },
    { filename: 'tv_cf_13_1d_alma_lvl.png', url: 'https://www.tradingview.com/chart/XV0L73xp/' },
    { filename: 'tv_cf_14_1d_ago.png',      url: 'https://www.tradingview.com/chart/jsmvbxBi/' },
    { filename: 'tv_pif_13_1d_warn.png',    url: 'https://www.tradingview.com/chart/H2iw7QuE/' },
    { filename: 'tv_pif_16_1d_mfi.png',     url: 'https://www.tradingview.com/chart/NmBQlMHI/' }
];

async function findPanelByCanvas(page, canvasSelector) {
    try {
        const canvas = await page.$(canvasSelector);
        if (!canvas) return null;
        const panel = await canvas.evaluateHandle(el => {
            let cur = el;
            while (cur && !cur.classList.contains('card-body')) cur = cur.parentElement;
            return cur ? cur.closest('.card') : null;
        });
        return panel.asElement();
    } catch { return null; }
}

(async () => {
    console.log('=== capture_all.mjs: 12 скринов ===\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        userDataDir: USER_DATA_DIR,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1200,2400',
            '--disable-blink-features=AutomationControlled'
        ],
        ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();
    let total = 0;

    // --- Блок 1: crypto-family.com ---
    console.log('[1/2] crypto-family.com (6 скринов)');
    await page.setViewport({ width: 1200, height: 2400, deviceScaleFactor: 2 });
    await page.goto('https://crypto-family.com', { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(2500);

    for (const config of CF_CONFIG) {
        console.log(`  Панель: ${config.name}`);
        const panel = await findPanelByCanvas(page, config.canvasSelector);
        if (!panel) { console.warn(`  Не найдена: ${config.name}`); continue; }

        const canvas = await page.$(config.canvasSelector);
        if (canvas) await canvas.evaluate(el => el.scrollIntoView({ block: 'center' }));
        await delay(500);

        for (const tf of config.timeframes) {
            const handle = await panel.evaluateHandle((el, t) => {
                const btns = Array.from(el.querySelectorAll('button.timeframe-btn'));
                return btns.find(b => b.textContent.trim() === t) || null;
            }, tf);
            const btn = handle.asElement();
            if (!btn) { console.warn(`  Нет кнопки ${tf}`); continue; }

            await btn.click();
            await page.waitForNetworkIdle({ idleTime: 250 }).catch(() => delay(1000));
            await delay(1000);

            const cnv = await page.$(config.canvasSelector);
            if (!cnv) { console.warn(`  Canvas не найден (${tf})`); continue; }

            const key = `${config.prefix}_${tf}`;
            const filename = CF_FILE_MAP[key];
            if (!filename) { console.error(`  Нет маппинга: ${key}`); continue; }

            await cnv.screenshot({ path: join(OUTPUT_DIR, filename) });
            console.log(`  -> ${filename}`);
            total++;
        }
    }

    // --- Блок 2: TradingView ---
    console.log('\n[2/2] TradingView (6 скринов)');
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

    for (const chart of TV_CONFIG) {
        try {
            console.log(`  ${chart.filename}`);
            await page.goto(chart.url, { waitUntil: 'networkidle2', timeout: 60000 });
            await delay(3000);

            const el = await page.$('.layout__area--center');
            if (el) {
                await el.screenshot({ path: join(OUTPUT_DIR, chart.filename) });
            } else {
                await page.screenshot({ path: join(OUTPUT_DIR, chart.filename) });
            }
            console.log(`  -> OK`);
            total++;
        } catch (e) {
            console.error(`  Ошибка: ${e.message}`);
        }
    }

    await browser.close();
    console.log(`\nИтого: ${total}/12`);

    if (total < 12) {
        console.error('Не все скрины сделаны!');
        process.exit(1);
    }
})();
