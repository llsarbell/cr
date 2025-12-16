#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")" || exit

echo "🔄 (TV CF) Синхронизация..."
git stash
git pull --rebase origin main
git stash pop 2>/dev/null

# 1. УДАЛЕНИЕ
echo "🗑️ Удаление старых TV CF с сервера..."
rm -f screenshots/tv_cf_*.png
git add -u screenshots/
if ! git diff --cached --quiet; then
    git commit -m "Delete TV CF charts before update"
    git push origin main
fi

# 2. ГЕНЕРАЦИЯ
echo "📸 (TV CF) Генерация..."
node capture_tv.mjs

if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте (TV)"
    exit 1
fi

# 3. ЗАЛИВКА
echo "📤 (TV CF) Заливка..."
git add screenshots/tv_cf_*.png

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "tv_cf_upd - $TIMESTAMP"
git push origin main

echo "✅ TV CF обновлены"
