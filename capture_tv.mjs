import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Папки
const USER_DATA_DIR = join(__dirname, 'chrome-profile');
const OUTPUT_DIR = join(__dirname, 'screenshots');

// Создаем папку если нет
try { mkdirSync(OUTPUT_DIR, { recursive: true }); } catch (err) {}

// === СПИСОК ГРАФИКОВ (новый нейминг: tv_cf_*) ===
const CHARTS_CONFIG = [
    { filename: 'tv_cf_01_1d_trend_rsi.png', url: 'https://www.tradingview.com/chart/Q1AQBZrq/' },
    { filename: 'tv_cf_02_1d_div_all.png', url: 'https://www.tradingview.com/chart/DeeS34sy/' },
    { filename: 'tv_cf_03_1d_vix_bb.png', url: 'https://www.tradingview.com/chart/FKGbmWE4/' },
    { filename: 'tv_cf_04_1d_vix_atr.png', url: 'https://www.tradingview.com/chart/3xV75vBD/' },
    { filename: 'tv_cf_05_1d_vix_rsi.png', url: 'https://www.tradingview.com/chart/ytxm5gs9/' },
    { filename: 'tv_cf_06_1d_stoch_rsi.png', url: 'https://www.tradingview.com/chart/cG9MGbO9/' },
    { filename: 'tv_cf_07_1d_rsi_alma.png', url: 'https://www.tradingview.com/chart/KMnL6TUq/' },
    { filename: 'tv_cf_08_1d_deviation.png', url: 'https://www.tradingview.com/chart/PUHCVJ0v/' },
    { filename: 'tv_cf_09_1d_pd200.png', url: 'https://www.tradingview.com/chart/jfA8pIDD/' },
    { filename: 'tv_cf_10_1d_devo.png', url: 'https://www.tradingview.com/chart/ZfqQJxQa/' },
    { filename: 'tv_cf_11_1d_bol_top_bot.png', url: 'https://www.tradingview.com/chart/g0hiXx49/' },
    { filename: 'tv_cf_12_1d_bb_trend_ma.png', url: 'https://www.tradingview.com/chart/k6SvW2my/' },
    { filename: 'tv_cf_13_1d_atr_top_bot.png', url: 'https://www.tradingview.com/chart/PBZOOFl1/' },
    { filename: 'tv_cf_14_1d_atr_peak.png', url: 'https://www.tradingview.com/chart/ag7V09GT/' },
    { filename: 'tv_cf_15_1d_angle_7.png', url: 'https://www.tradingview.com/chart/bMXvYCVF/' },
    { filename: 'tv_cf_16_1d_alma_lvl.png', url: 'https://www.tradingview.com/chart/XV0L73xp/' },
    { filename: 'tv_cf_17_1d_ago.png', url: 'https://www.tradingview.com/chart/jsmvbxBi/' },
    { filename: 'tv_cf_18_1d_adiv.png', url: 'https://www.tradingview.com/chart/nXNIFZcY/' },
    { filename: 'tv_cf_19_1d_5ma_heatmap.png', url: 'https://www.tradingview.com/chart/l5FfuBfr/' },
    { filename: 'tv_cf_20_1d_fear_greed.png', url: 'https://www.tradingview.com/chart/0X2q2DVL/' }
];

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log(`🚀 Начинаем обработку ${CHARTS_CONFIG.length} графиков TradingView...`);
    
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
    // Ставим масштаб х2 для четкости (retina) и квадратный размер
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

    let count = 0;

    for (const chart of CHARTS_CONFIG) {
        try {
            console.log(`\n[${++count}/${CHARTS_CONFIG.length}] Открываем: ${chart.filename}`);
            
            await page.goto(chart.url, { waitUntil: 'networkidle2', timeout: 60000 });
            
            // Ждем прогрузки индикаторов
            await delay(2500); 

            // Удаляем всплывающие плашки, если есть, и пытаемся найти график
            // Обычно график лежит в .layout__area--center
            const element = await page.$('.layout__area--center');

            if (element) {
                await element.screenshot({ path: join(OUTPUT_DIR, chart.filename) });
                console.log(`   ✓ Сохранено`);
            } else {
                // Если не нашли центр, снимаем весь экран
                await page.screenshot({ path: join(OUTPUT_DIR, chart.filename) });
                console.log(`   ⚠️ Сохранено (Full Page) - селектор не найден`);
            }

        } catch (e) {
            console.error(`   ❌ Ошибка: ${e.message}`);
        }
    }

    console.log(`\n🏁 Готово!`);
    await browser.close();
})();
