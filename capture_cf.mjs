import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USER_DATA_DIR = join(__dirname, 'chrome-profile');
const OUTPUT_DIR = join(__dirname, 'screenshots');
const BASE_URL = 'https://crypto-family.com';

try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (err) {}

// --- СПИСОК ГРАФИКОВ (16 индикаторов) ---
const CHARTS_CONFIG = [
  { name: 'BTC Magma Signals', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(2) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['4h', '1d', '1w'], prefix: 'magma' },
  { name: 'BTC BB Signals', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(3) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['4h', '1d'], prefix: 'bb' },
  { name: 'BTC Long-Short Ratio', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(4) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'lsratio' },
  { name: 'BTC Long-Short CEX', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(5) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'lscex' },
  { name: 'Fear & Greed Indicator Alternative API', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(7) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1m'], prefix: 'fgi_alt' },
  { name: 'VIX RSI Volatility', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(8) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'vix' },
  { name: 'Trend RSI Bitcoin', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(10) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'trendrsi_btc' },
  { name: 'FR x OI', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(12) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d', '1w'], prefix: 'fr_oi' },
  { name: 'Funding Rate', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(11) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d', '1w'], prefix: 'funding' },
  { name: 'Liquidation Imbalance', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(13) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'liq', hasExchangeSelector: true, exchangeValue: 'bybit' },
  { name: 'BTC OI / 24h Volume', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(14) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'oi_vol' }
];

// Карта имён файлов (новая нумерация: 16 индикаторов)
const FILE_NAME_MAP = {
  magma_4h: 'cf_01_4h_magma.png',
  magma_1d: 'cf_02_1d_magma.png',
  magma_1w: 'cf_03_1w_magma.png',

  bb_4h: 'cf_04_4h_bb.png',
  bb_1d: 'cf_05_1d_bb.png',

  lsratio_1d: 'cf_06_1d_dex_long_short.png',

  lscex_1d: 'cf_07_1d_cex_long_short.png',

  fgi_alt_1m: 'cf_08_1m_fear_greed_alt.png',

  vix_1d: 'cf_09_1d_vix_rsi.png',

  trendrsi_btc_1d: 'cf_10_1d_btc_trend_rsi.png',

  fr_oi_1d: 'cf_11_1d_fr_x_oi.png',
  fr_oi_1w: 'cf_12_1w_fr_x_oi.png',

  funding_1d: 'cf_13_1d_funding.png',
  funding_1w: 'cf_14_1w_funding.png',

  liq_1d: 'cf_15_1d_liq_imbalance.png',
  oi_vol_1d: 'cf_16_1d_oi_volume.png'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function findPanelByCanvas(page, canvasSelector) {
  try {
    const canvas = await page.$(canvasSelector);
    if (!canvas) return null;

    const panel = await canvas.evaluateHandle(el => {
      let current = el;
      while (current && !current.classList.contains('card-body')) {
        current = current.parentElement;
      }
      return current ? current.closest('.card') : null;
    });

    return panel.asElement();
  } catch {
    return null;
  }
}

async function captureCharts() {
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: USER_DATA_DIR,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,2400']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 2400, deviceScaleFactor: 2 });

  console.log('Открываем главную страницу...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await delay(2500);

  let totalScreenshots = 0;

  for (const config of CHARTS_CONFIG) {
    console.log(`\n=== Обработка панели: ${config.name} ===`);

    try {
      const canvas = await page.$(config.canvasSelector);
      if (canvas) {
        await canvas.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await delay(500);
      }
    } catch {}

    const panel = await findPanelByCanvas(page, config.canvasSelector);
    if (!panel) {
      console.warn(`⚠️ Панель "${config.name}" не найдена`);
      continue;
    }

    // Выбор биржи для Liquidation Imbalance (Bybit)
    if (config.hasExchangeSelector) {
      try {
        console.log(` → Выбираем биржу: ${config.exchangeValue.toUpperCase()}`);
        const selectElement = await panel.$('#exchangeSelect');
        if (selectElement) {
          await selectElement.select(config.exchangeValue);
          await page.waitForNetworkIdle({ idleTime: 250 }).catch(() => delay(1000));
          await delay(1000);
        } else {
          console.warn(' ⚠️ Селект биржи не найден');
        }
      } catch (error) {
        console.error(' ❌ Ошибка при выборе биржи:', error.message);
      }
    }

    // Обычные таймфреймы
    for (const tf of config.timeframes) {
      try {
        console.log(` → Таймфрейм: ${tf}`);
        const handle = await panel.evaluateHandle((el, timeframe) => {
          const buttons = Array.from(el.querySelectorAll('button.timeframe-btn'));
          return buttons.find(btn => btn.textContent.trim() === timeframe) || null;
        }, tf);

        const tfButton = handle.asElement();
        if (!tfButton) {
          console.warn(` ⚠️ Кнопка "${tf}" не найдена`);
          continue;
        }

        await tfButton.click();
        await page.waitForNetworkIdle({ idleTime: 250 }).catch(() => delay(1000));
        await delay(1000);

        const canvas = await page.$(config.canvasSelector);
        if (!canvas) {
          console.warn(' ⚠️ Canvas не найден');
          continue;
        }

        const key = `${config.prefix}_${tf}`;
        const filename = FILE_NAME_MAP[key];
        if (!filename) {
          console.error(`❌ Нет маппинга для ключа: ${key}`);
          continue;
        }
        await canvas.screenshot({ path: join(OUTPUT_DIR, filename) });
        console.log(` ✓ Сохранено: ${filename}`);
        totalScreenshots++;
      } catch (error) {
        console.error(` ❌ Ошибка для ${tf}:`, error.message);
      }
    }
  }

  console.log(`\n✅ Все скриншоты готовы! Всего сохранено: ${totalScreenshots}`);
  await browser.close();
}

captureCharts().catch(console.error);
