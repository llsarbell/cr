#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")" || exit

echo "🔄 (TV PIF) Синхронизация..."
git stash
git fetch origin && git pull origin main --no-rebase || git stash pop
git stash pop 2>/dev/null

echo "🗑️ Удаление старых TV PIF с сервера..."
git rm -f screenshots/tv_pif_*.png 2>/dev/null
git commit -m "Delete TV PIF charts before update" 2>/dev/null
git push origin main 2>/dev/null

echo "📸 (TV PIF) Генерация..."
node capture_tv_pif.mjs
if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте (PIF)"
    exit 1
fi

git add screenshots/tv_pif_*.png
git commit -m "Update TV PIF charts"
git push origin main

echo "✅ TV PIF обновлены (2 шт)"
