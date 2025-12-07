#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"

echo "================================================"
echo "🚀 ЗАПУСК ПОЛНОГО ЦИКЛА (CF + TV + PIF)"
echo "📅 Дата: $(date)"
echo "================================================"

cd "$(dirname "$0")" || exit

# 1. Запускаем CryptoFamily (05)
echo ""
echo ">>> [1/3] Запуск CryptoFamily (05)..."
./run_05_cf_csr.sh

# 2. Запускаем TradingView CF (06)
echo ""
echo ">>> [2/3] Запуск TV CryptoFamily (06)..."
./run_06_tv_cf_scr.sh

# 3. Запускаем TradingView PIF (07)
echo ""
echo ">>> [3/3] Запуск TV PIF Strategy (07)..."
./run_07_tv_pif_scr.sh

echo ""
echo "================================================"
echo "✅ ПОЛНЫЙ ЦИКЛ ЗАВЕРШЕН!"
echo "================================================"

