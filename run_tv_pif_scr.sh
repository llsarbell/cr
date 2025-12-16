#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")" || exit

echo "🔄 (TV PIF) Синхронизация..."
git stash
git pull --rebase origin main
git stash pop 2>/dev/null

# 1. УДАЛЕНИЕ
echo "🗑️ Удаление старых TV PIF с сервера..."
rm -f screenshots/tv_pif_*.png
git add -u screenshots/
if ! git diff --cached --quiet; then
    git commit -m "Delete TV PIF charts before update"
    git push origin main
fi

# 2. ГЕНЕРАЦИЯ
echo "📸 (TV PIF) Генерация..."
# Внимание: запускаем скрипт генерации. 
# Если у тебя вся логика (и CF, и PIF) внутри capture_tv.mjs, то запускаем его.
node capture_tv_pif.mjs

if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте (PIF)"
    exit 1
fi

# 3. ЗАЛИВКА
echo "📤 (TV PIF) Заливка..."
git add screenshots/tv_pif_*.png

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "tv_pif_upd - $TIMESTAMP"
git push origin main

echo "✅ TV PIF обновлены"
