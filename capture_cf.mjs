import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- ОСНОВНЫЕ НАСТРОЙКИ ---
const USER_DATA_DIR = join(__dirname, 'chrome-profile');
const OUTPUT_DIR = join(__dirname, 'screenshots');
const BASE_URL = 'https://crypto-family.com';

// --- НОВАЯ КОНФИГУРАЦИЯ ИМЕН ---
const CHARTS_CONFIG = [
    { name: 'BTC Magma Signals', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(2) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '4h', file: 'cf_01_4h_magma.png' }, { tf: '1d', file: 'cf_02_1d_magma.png' }, { tf: '1w', file: 'cf_03_1w_magma.png' }] },
    { name: 'BTC BB Signals', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(3) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '4h', file: 'cf_04_4h_bb.png' }, { tf: '1d', file: 'cf_05_1d_bb.png' }] },
    { name: 'BTC Long-Short Ratio', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(4) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '1h', file: 'cf_06_1h_dex_long_short.png' }, { tf: '4h', file: 'cf_07_4h_dex_long_short.png' }, { tf: '12h', file: 'cf_08_12h_dex_long_short.png' }, { tf: '1d', file: 'cf_09_1d_dex_long_short.png' }] },
    { name: 'BTC Long-Short CEX', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(5) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '4h', file: 'cf_10_4h_cex_long_short.png' }, { tf: '12h', file: 'cf_11_12h_cex_long_short.png' }, { tf: '1d', file: 'cf_12_1d_cex_long_short.png' }] },
    { name: 'Fear & Greed Indicator', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(6) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '1m', file: 'cf_13_1m_fear_greed.png' }, { tf: '3m', file: 'cf_14_3m_fear_greed.png' }, { tf: '1y', file: 'cf_15_1y_fear_greed.png' }] },
    { name: 'Fear & Greed Indicator Alternative API', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(7) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '1m', file: 'cf_16_1m_fear_greed_alt.png' }, { tf: '3m', file: 'cf_17_3m_fear_greed_alt.png' }, { tf: '1y', file: 'cf_18_1y_fear_greed_alt.png' }] },
    { name: 'VIX RSI Volatility', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(8) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '4h', file: 'cf_19_4h_vix_rsi.png' }, { tf: '1d', file: 'cf_20_1d_vix_rsi.png' }] },
    { name: 'Trend RSI Altcoins', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(9) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', hasRiskSelector: true, riskTypes: [{ type: 'primary', file: 'cf_21_1d_low_alts_trend.png' }, { type: 'secondary', file: 'cf_22_1d_mid_alts_trend.png' }, { type: 'tertiary', file: 'cf_23_1d_high_alts_trend.png' }] },
    { name: 'Trend RSI Bitcoin', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(10) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '1d', file: 'cf_24_1d_btc_trend_rsi.png' }] },
    { name: 'Funding Rate', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(11) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '1d', file: 'cf_25_1d_funding.png' }, { tf: '1w', file: 'cf_26_1w_funding.png' }] },
    { name: 'Liquidation Imbalance', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(12) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '1d', file: 'cf_27_1d_liq_imbalance.png' }] },
    { name: 'BTC OI / 24h Volume', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(13) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: [{ tf: '1d', file: 'cf_28_1d_oi_volume.png' }] }
];
// --- КОНЕЦ КОНФИГУРАЦИИ ---

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function findPanelByCanvas(page, canvasSelector) {
    try {
        const canvas = await page.$(canvasSelector);
        if (!canvas) return null;
        const panel = await canvas.evaluateHandle(el => {
            let current = el;
            while (current && !current.classList.contains('card-body')) current = current.parentElement;
            return current ? current.closest('.card') : null;
        });
        return panel.asElement();
    } catch (error) { return null; }
}

async function captureCharts() {
    const browser = await puppeteer.launch({ headless: "new", userDataDir: USER_DATA_DIR, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 2 });
    try { mkdirSync(OUTPUT_DIR, { recursive: true }); } catch (err) {}

    console.log('Открываем главную страницу...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await delay(5000);

    let totalScreenshots = 0;
    for (const config of CHARTS_CONFIG) {
        console.log(`\n=== Обработка: ${config.name} ===`);
        const panel = await findPanelByCanvas(page, config.canvasSelector);
        if (!panel) { console.warn(`⚠️ Панель не найдена`); continue; }
        
        try {
            const canvas = await page.$(config.canvasSelector);
            if (canvas) await canvas.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await delay(1000);
        } catch (e) {}

        if (config.hasRiskSelector) {
            for (const risk of config.riskTypes) {
                try {
                    const selectElement = await panel.$('#rangeTypeSelect');
                    if (selectElement) await selectElement.select(risk.type);
                    await delay(2500);
                    const canvas = await page.$(config.canvasSelector);
                    if (canvas) {
                        await canvas.screenshot({ path: join(OUTPUT_DIR, risk.file) });
                        console.log(` ✓ Сохранено: ${risk.file}`);
                        totalScreenshots++;
                    }
                } catch (err) { console.error(` ❌ Ошибка для ${risk.file}:`, err.message); }
            }
        } else {
            for (const item of config.timeframes) {
                try {
                    const tfButton = await panel.evaluateHandle((el, timeframe) => {
                        const buttons = Array.from(el.querySelectorAll('button.timeframe-btn'));
                        return buttons.find(btn => btn.textContent.trim() === timeframe);
                    }, item.tf);

                    if (tfButton.asElement()) {
                        await tfButton.asElement().click();
                        await delay(2500);
                        const canvas = await page.$(config.canvasSelector);
                        if (canvas) {
                            await canvas.screenshot({ path: join(OUTPUT_DIR, item.file) });
                            console.log(` ✓ Сохранено: ${item.file}`);
                            totalScreenshots++;
                        }
                    } else { console.warn(` ⚠️ Кнопка ${item.tf} не найдена`); }
                } catch (err) { console.error(` ❌ Ошибка для ${item.file}:`, err.message); }
            }
        }
    }
    console.log(`\n✅ Готово! Всего сохранено: ${totalScreenshots}`);
    await browser.close();
}

captureCharts().catch(console.error);
