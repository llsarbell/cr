#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")" || exit

echo "================================================"
echo "🚀 ЗАПУСК ПОЛНОГО ЦИКЛА (CF + TV + PIF)"
echo "📅 Дата: $(date)"
echo "================================================"

echo ""
echo ">>> [1/3] Запуск CryptoFamily (cf)..."
./run_cf_csr.sh

echo ""
echo ">>> [2/3] Запуск TV CryptoFamily (tv_cf)..."
./run_tv_cf_scr.sh

echo ""
echo ">>> [3/3] Запуск TV PIF Strategy (tv_pif)..."
./run_tv_pif_scr.sh

echo ""
echo "================================================"
echo "✅ ПОЛНЫЙ ЦИКЛ ЗАВЕРШЕН!"
echo "================================================"
