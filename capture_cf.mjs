import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USER_DATA_DIR = join(__dirname, 'chrome-profile');
const OUTPUT_DIR = join(__dirname, 'screenshots');
const BASE_URL = 'https://crypto-family.com';

try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (err) {}

// --- СПИСОК ГРАФИКОВ ---
const CHARTS_CONFIG = [
  { name: 'BTC Magma Signals', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(2) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['4h', '1d', '1w'], prefix: 'magma' },
  { name: 'BTC BB Signals', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(3) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['4h', '1d'], prefix: 'bb' },
  { name: 'BTC Long-Short Ratio', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(4) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1h', '4h', '12h', '1d'], prefix: 'lsratio' },
  { name: 'BTC Long-Short CEX', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(5) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['4h', '12h', '1d'], prefix: 'lscex' },
  { name: 'Fear & Greed Indicator', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(6) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1m', '3m', '1y'], prefix: 'fgi' },
  { name: 'Fear & Greed Indicator Alternative API', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(7) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1m', '3m', '1y'], prefix: 'fgi_alt' },
  { name: 'VIX RSI Volatility', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(8) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['4h', '1d'], prefix: 'vix' },
  { name: 'Trend RSI Altcoins', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(9) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'trendrsi_alt', hasRiskSelector: true, riskTypes: ['primary', 'secondary', 'tertiary'], riskLabels: ['low', 'mid', 'high'] },
  { name: 'Trend RSI Bitcoin', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(10) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'trendrsi_btc' },
  { name: 'Funding Rate', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(11) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d', '1w'], prefix: 'funding' },
  { name: 'FR x OI', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(12) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d', '1w'], prefix: 'fr_oi' },
  { name: 'Liquidation Imbalance', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(13) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'liq', hasExchangeSelector: true, exchangeValue: 'bybit' },
  { name: 'BTC OI / 24h Volume', canvasSelector: '#app > div > div.content-wrapper > div > section > div > div > div:nth-child(2) > div > div > div > div:nth-child(14) > div.card-body > div:nth-child(2) > div > div:nth-child(1) > div > canvas.am5-layer-30', timeframes: ['1d'], prefix: 'oi_vol' }
];

// карта красивых имён файлов
const FILE_NAME_MAP = {
  magma_4h: '05_cf_01_4h_magma.png',
  magma_1d: '05_cf_02_1d_magma.png',
  magma_1w: '05_cf_03_1w_magma.png',

  bb_4h: '05_cf_04_4h_bb.png',
  bb_1d: '05_cf_05_1d_bb.png',

  lsratio_1h:  '05_cf_06_1h_dex_long_short.png',
  lsratio_4h:  '05_cf_07_4h_dex_long_short.png',
  lsratio_12h: '05_cf_08_12h_dex_long_short.png',
  lsratio_1d:  '05_cf_09_1d_dex_long_short.png',

  lscex_4h:  '05_cf_10_4h_cex_long_short.png',
  lscex_12h: '05_cf_11_12h_cex_long_short.png',
  lscex_1d:  '05_cf_12_1d_cex_long_short.png',

  fgi_1m: '05_cf_13_1m_fear_greed.png',
  fgi_3m: '05_cf_14_3m_fear_greed.png',
  fgi_1y: '05_cf_15_1y_fear_greed.png',

  fgi_alt_1m: '05_cf_16_1m_fear_greed_alt.png',
  fgi_alt_3m: '05_cf_17_3m_fear_greed_alt.png',
  fgi_alt_1y: '05_cf_18_1y_fear_greed_alt.png',

  vix_4h: '05_cf_19_4h_vix_rsi.png',
  vix_1d: '05_cf_20_1d_vix_rsi.png',

  trendrsi_alt_low:  '05_cf_21_1d_low_alts_trend.png',
  trendrsi_alt_mid:  '05_cf_22_1d_mid_alts_trend.png',
  trendrsi_alt_high: '05_cf_23_1d_high_alts_trend.png',

  trendrsi_btc_1d: '05_cf_24_1d_btc_trend_rsi.png',

  fr_oi_1d: '05_cf_25_1d_fr_x_oi.png',
  fr_oi_1w: '05_cf_26_1w_fr_x_oi.png',

  funding_1d: '05_cf_27_1d_funding.png',
  funding_1w: '05_cf_28_1w_funding.png',

  liq_1d: '05_cf_29_1d_liq_imbalance.png',
  oi_vol_1d: '05_cf_30_1d_oi_volume.png'
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

async function runGitCommands() {
  try {
    execSync('git add ./*.png', { cwd: OUTPUT_DIR });
    const commitMsg = `Update CF screenshots - ${new Date().toISOString()}`;
    execSync(`git commit -m "${commitMsg}"`, { cwd: OUTPUT_DIR });
    execSync('git push origin main', { cwd: OUTPUT_DIR });
    console.log('✅ Скриншоты успешно выгружены в Git!');
  } catch (error) {
    console.error('❌ Ошибка при git push:', error.message);
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
  await delay(5000);

  let totalScreenshots = 0;

  for (const config of CHARTS_CONFIG) {
    console.log(`\n=== Обработка панели: ${config.name} ===`);

    try {
      const canvas = await page.$(config.canvasSelector);
      if (canvas) {
        await canvas.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await delay(1000);
      }
    } catch {}

    const panel = await findPanelByCanvas(page, config.canvasSelector);
    if (!panel) {
      console.warn(`⚠️ Панель "${config.name}" не найдена`);
      continue;
    }

    // Особый режим: Trend RSI Altcoins (low/mid/high)
    if (config.hasRiskSelector) {
      for (let i = 0; i < config.riskTypes.length; i++) {
        const riskType = config.riskTypes[i];
        const riskLabel = config.riskLabels[i];
        try {
          console.log(` → Risk mode: ${riskLabel.toUpperCase()}`);
          const selectElement = await panel.$('#rangeTypeSelect');
          if (selectElement) {
            await selectElement.select(riskType);
            await page.waitForNetworkIdle({ idleTime: 500 }).catch(() => delay(2000));
            await delay(2000);
          }

          const canvas = await page.$(config.canvasSelector);
          if (canvas) {
            const key = `${config.prefix}_${riskLabel}`;
            const filename = FILE_NAME_MAP[key] || `cf_${config.prefix}_1d_${riskLabel}.png`;
            await canvas.screenshot({ path: join(OUTPUT_DIR, filename) });
            console.log(` ✓ Сохранено: ${filename}`);
            totalScreenshots++;
          } else {
            console.warn(' ⚠️ Canvas не найден');
          }
        } catch (error) {
          console.error(` ❌ Ошибка для ${riskLabel}:`, error.message);
        }
      }
      continue;
    }

    // Выбор биржи для Liquidation Imbalance (Bybit)
    if (config.hasExchangeSelector) {
      try {
        console.log(` → Выбираем биржу: ${config.exchangeValue.toUpperCase()}`);
        const selectElement = await panel.$('#exchangeSelect');
        if (selectElement) {
          await selectElement.select(config.exchangeValue);
          await page.waitForNetworkIdle({ idleTime: 500 }).catch(() => delay(2000));
          await delay(2000);
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
        await page.waitForNetworkIdle({ idleTime: 500 }).catch(() => delay(2000));
        await delay(2000);

        const canvas = await page.$(config.canvasSelector);
        if (!canvas) {
          console.warn(' ⚠️ Canvas не найден');
          continue;
        }

        const key = `${config.prefix}_${tf}`;
        const filename = FILE_NAME_MAP[key] || `cf_${config.prefix}_${tf}.png`;
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
  await runGitCommands();
}

captureCharts().catch(console.error);
