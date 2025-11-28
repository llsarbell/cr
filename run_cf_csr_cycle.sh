#!/bin/bash

echo "🚀 Запуск цикла сбора скриншотов CF"
echo "============================================"

cd "$(dirname "$0")" || exit

echo ""
echo "🔄 Синхронизация с GitHub..."
git stash
git pull --rebase origin main
git stash pop 2>/dev/null

echo ""
echo "🗑️ Очистка ВСЕХ старых файлов..."
# Удаляем совсем старые (без номера)
rm -f screenshots/cf_*.png
# Удаляем текущие (с номером), чтобы гарантировать перегенерацию
rm -f screenshots/05_cf_*.png

echo ""
echo "📸 Сбор скриншотов (05_cf)..."
node capture_cf.mjs

if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте"
    exit 1
fi

echo ""
echo "📤 Отправка в GitHub..."

# Добавляем новые
git add screenshots/05_cf_*.png
# Фиксируем удаление старых имен (если они были в гите)
git add -u screenshots/

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Update CF screenshots - $TIMESTAMP"

git push origin main

echo ""
echo "✅ CF-скриншоты обновлены!"

