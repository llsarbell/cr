#!/bin/bash

cd "$(dirname "$0")" || exit

echo "🔄 (CF) Синхронизация..."
git stash
git pull --rebase origin main
git stash pop 2>/dev/null

# 1. УДАЛЯЕМ ФАЙЛЫ С СЕРВЕРА (чтобы очистить место под новые)
echo "🗑️ Удаление старых версий с сервера..."
# Удаляем локально
rm -f screenshots/05_cf_*.png
# Говорим гиту, что они удалены
git add -u screenshots/
# Если есть что удалять - коммитим и пушим
if ! git diff --cached --quiet; then
    git commit -m "Delete CF charts before update"
    git push origin main
    echo "   -> Файлы удалены с сервера."
fi

# 2. ГЕНЕРИРУЕМ НОВЫЕ
echo "📸 (CF) Генерация новых..."
node capture_cf.mjs

if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте"
    exit 1
fi

# 3. ЗАЛИВАЕМ НОВЫЕ
echo "📤 (CF) Заливка свежих файлов..."
git add screenshots/05_cf_*.png

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "05_scr_upd - $TIMESTAMP"
git push origin main

echo "✅ CF-скриншоты обновлены"
