#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")" || exit

echo "🔄 (CF) Синхронизация..."
git stash
git fetch origin && git pull origin main --no-rebase || git stash pop
git stash pop 2>/dev/null

echo "🗑️ Удаление старых версий с сервера..."
git rm -f screenshots/cf_*.png 2>/dev/null
git commit -m "Delete CF charts before update" 2>/dev/null
git push origin main 2>/dev/null
echo "   -> Файлы удалены с сервера."

echo "📸 (CF) Генерация новых..."
node capture_cf.mjs
if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте"
    exit 1
fi

git add screenshots/cf_*.png
git commit -m "Update CF charts"
git push origin main

echo "✅ CF обновлены (16 шт)"
