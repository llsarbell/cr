#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

cd "$(dirname "$0")" || exit

echo "=== CAPTURE: синхронизация ==="
git stash
git fetch origin && git pull origin main --no-rebase || true
git stash pop 2>/dev/null

echo "=== CAPTURE: зачистка всех скринов с GitHub ==="
git rm -f screenshots/*.png 2>/dev/null
git commit -m "Clear all screenshots before update" 2>/dev/null
git push origin main 2>/dev/null

echo "=== CAPTURE: съёмка 12 скринов ==="
node capture_all.mjs
if [ $? -ne 0 ]; then
    echo "Ошибка: capture_all.mjs завершился с ошибкой"
    exit 1
fi

echo "=== CAPTURE: пуш на GitHub ==="
git add screenshots/*.png
git commit -m "Update screenshots (12 vs-indicators)"
git push origin main

echo "=== CAPTURE: готово (12 скринов) ==="
