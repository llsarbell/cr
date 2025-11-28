#!/bin/bash

echo "🚀 Запуск цикла обновления TradingView"
echo "============================================"

# 1. Переходим в папку скрипта
cd "$(dirname "$0")" || exit

# 2. Синхронизация
echo ""
echo "🔄 Предварительная синхронизация..."
git stash
git pull --rebase origin main
git stash pop 2>/dev/null

# 3. Удаляем старый файл (если он еще есть)
rm -f screenshots/tw_cf_01_1d_div_all_rsi.png

# 4. Запуск Puppeteer
echo ""
echo "📸 Запуск Puppeteer (TV)..."
node capture_tv.mjs

if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте"
    exit 1
fi

# 5. Отправка в Git
echo ""
echo "📤 Загрузка в GitHub..."

# Добавляем новые файлы и удаление старого
git add screenshots/06_*.png
git add screenshots/tw_cf_01_1d_div_all_rsi.png 2>/dev/null

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Update TV charts - $TIMESTAMP"

git push origin main

echo ""
echo "✅ TV-скриншоты обновлены!"
