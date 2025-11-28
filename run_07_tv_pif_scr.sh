#!/bin/bash

echo "🚀 Запуск цикла PIF Strategy"
echo "============================================"

cd "$(dirname "$0")" || exit

# Синхронизация
echo ""
echo "🔄 Синхронизация..."
git stash
git pull --rebase origin main
git stash pop 2>/dev/null

# Запуск
echo ""
echo "📸 Запуск Puppeteer (PIF)..."
node capture_tv_pif.mjs

if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте"
    exit 1
fi

# Отправка
echo ""
echo "📤 Загрузка в GitHub..."

# Добавляем ТОЛЬКО файлы этой стратегии
git add screenshots/07_tv_pif_*.png

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Update PIF Strategy charts - $TIMESTAMP"
git push origin main

echo ""
echo "✅ PIF-скриншоты обновлены!"
