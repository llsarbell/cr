#!/bin/bash
# sync_screenshots.sh - синхронизирует локальную папку screenshots/ с GitHub
# Локальный результат = точная копия того что на GitHub

export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")" || exit

echo "=== Синхронизация screenshots/ с GitHub ==="

git fetch origin
git checkout origin/main -- screenshots/
git reset HEAD screenshots/ 2>/dev/null

# Удаляем локальные файлы которых нет на GitHub
git ls-files --others screenshots/*.png 2>/dev/null | while read f; do
    rm -f "$f"
    echo "Удалён лишний: $f"
done

COUNT=$(ls screenshots/*.png 2>/dev/null | wc -l | tr -d ' ')
echo "=== Готово: $COUNT файлов в screenshots/ ==="
ls screenshots/*.png 2>/dev/null | xargs -I{} basename {}
