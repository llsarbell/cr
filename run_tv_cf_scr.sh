#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")" || exit

echo "🔄 (TV CF) Синхронизация..."
git stash
git fetch origin && git pull origin main --no-rebase || git stash pop
git stash pop 2>/dev/null

echo "🗑️ Удаление старых TV CF с сервера..."
git rm -f screenshots/tv_cf_*.png 2>/dev/null
git commit -m "Delete TV CF charts before update" 2>/dev/null
git push origin main 2>/dev/null

echo "📸 (TV CF) Генерация..."
node capture_tv.mjs
if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте (TV)"
    exit 1
fi

git add screenshots/tv_cf_*.png
git commit -m "Update TV CF charts"
git push origin main

echo "✅ TV CF обновлены (4 шт)"
