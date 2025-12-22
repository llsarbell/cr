import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Папки
const USER_DATA_DIR = join(__dirname, 'chrome-profile');
const OUTPUT_DIR = join(__dirname, 'screenshots');

try { mkdirSync(OUTPUT_DIR, { recursive: true }); } catch (err) {}

// === СТРАТЕГИЯ PIF (25 индикаторов) ===
// delay: индивидуальный таймаут для тяжёлых графиков (по умолчанию 3000)
const CHARTS_CONFIG = [
    { filename: 'tv_pif_01_1d_div.png', url: 'https://www.tradingview.com/chart/IVWjCSts/' },
    { filename: 'tv_pif_02_12h_hero.png', url: 'https://www.tradingview.com/chart/q1O0b9l5/', delay: 5000 },
    { filename: 'tv_pif_03_1d_big_guy.png', url: 'https://www.tradingview.com/chart/7iMfXXlW/' },
    { filename: 'tv_pif_04_1d_hist_r_s_m.png', url: 'https://www.tradingview.com/chart/z9k0uaIB/' },
    { filename: 'tv_pif_05_1d_trader_01.png', url: 'https://www.tradingview.com/chart/38d1vWEf/' },
    { filename: 'tv_pif_06_1d_global_mini.png', url: 'https://www.tradingview.com/chart/SYRy7RY0/', delay: 5000 },
    { filename: 'tv_pif_07_1d_inside.png', url: 'https://www.tradingview.com/chart/61THKnE7/' },
    { filename: 'tv_pif_08_1d_bottom_line.png', url: 'https://www.tradingview.com/chart/qoNAuueL/' },
    { filename: 'tv_pif_09_1d_safety_trade.png', url: 'https://www.tradingview.com/chart/9pQ7IPF9/' },
    { filename: 'tv_pif_10_4h_radar.png', url: 'https://www.tradingview.com/chart/Ic1rsDd8/', delay: 5000 },
    { filename: 'tv_pif_11_1d_warm_buy.png', url: 'https://www.tradingview.com/chart/gOfQP0dQ/' },
    { filename: 'tv_pif_12_1d_dno_atr.png', url: 'https://www.tradingview.com/chart/eGg1nHFa/' },
    { filename: 'tv_pif_13_1d_warn.png', url: 'https://www.tradingview.com/chart/H2iw7QuE/' },
    { filename: 'tv_pif_14_1d_trap_line.png', url: 'https://www.tradingview.com/chart/8rnSMLKE/' },
    { filename: 'tv_pif_15_1d_money_waterfall.png', url: 'https://www.tradingview.com/chart/T09Oi69D/' },
    { filename: 'tv_pif_16_1d_mfi.png', url: 'https://www.tradingview.com/chart/NmBQlMHI/' },
    { filename: 'tv_pif_17_1d_opportunity.png', url: 'https://www.tradingview.com/chart/587S2H2K/' },
    { filename: 'tv_pif_18_1w_seven_days.png', url: 'https://www.tradingview.com/chart/fbv6PZ9y/' },
    { filename: 'tv_pif_19_1d_slow_buy.png', url: 'https://www.tradingview.com/chart/wgH61llC/' },
    { filename: 'tv_pif_20_1d_profit_loss.png', url: 'https://www.tradingview.com/chart/N9RghBzU/' },
    { filename: 'tv_pif_21_1d_cost_logarithms.png', url: 'https://www.tradingview.com/chart/VGvZXdcq/' },
    { filename: 'tv_pif_22_1d_pi_cycle.png', url: 'https://www.tradingview.com/chart/DdnbKmmB/' },
    { filename: 'tv_pif_23_1d_thermocap.png', url: 'https://www.tradingview.com/chart/YfIU6Ect/' },
    { filename: 'tv_pif_24_1d_gold.png', url: 'https://www.tradingview.com/chart/SI93p6nc/' },
    { filename: 'tv_pif_25_1d_btc_mood.png', url: 'https://www.tradingview.com/chart/qgXsz9Bs/' }
];

const DEFAULT_DELAY = 3000;
const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log(`🚀 Начинаем обработку ${CHARTS_CONFIG.length} графиков PIF Strategy...`);
    
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
                console.log(`   ✓ Сохранено`);
            } else {
                await page.screenshot({ path: join(OUTPUT_DIR, chart.filename) });
                console.log(`   ⚠️ Сохранено (Full Page)`);
            }
        } catch (e) { console.error(`   ❌ Ошибка: ${e.message}`); }
    }
    console.log(`\n🏁 Готово!`);
    await browser.close();
})();
