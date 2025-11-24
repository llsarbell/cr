#!/bin/bash

# Все пути теперь относительны или прямые
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
GIT_REPO_DIR="$PROJECT_DIR/screenshots"

echo "🚀 Запуск цикла обновления TradingView"
echo "============================================"

# Переходим в папку проекта
cd "$PROJECT_DIR" || exit

# --- ЭТАП 1: СИНХРОНИЗАЦИЯ ---
echo ""
echo "🔄 Предварительная синхронизация..."
if [ -d "$GIT_REPO_DIR" ]; then
  cd "$GIT_REPO_DIR" || exit
  git stash
  git pull --rebase origin main
  git stash pop 2>/dev/null
  cd "$PROJECT_DIR" # Возвращаемся обратно
else
  echo "❌ Ошибка: папка screenshots не найдена!"
  exit 1
fi

# --- ЭТАП 2: ГЕНЕРАЦИЯ ---
echo ""
echo "📸 Запуск Puppeteer (TV)..."
# Запускаем переименованный JS файл
node capture_tv.mjs

if [ $? -ne 0 ]; then
    echo "❌ Ошибка в JS скрипте"
    exit 1
fi

# --- ЭТАП 3: ОТПРАВКА ---
echo ""
echo "📤 Загрузка в GitHub..."
cd "$GIT_REPO_DIR" || exit

# Добавляем (обновляем) файл
git add tw_cf_01_1d_div_all_rsi.png

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
if git commit -m "Update TV chart - $TIMESTAMP" --quiet; then
  
  git pull --rebase origin main
  
  if git push origin main; then
    echo ""
    echo "✅ TV-скриншот обновлен!"
  else
    echo "⚠️ Ошибка git push"
  fi
else
  echo "ℹ️ Картинка не изменилась"
fi

echo "🔗 https://github.com/llsarbell/screenshots"
echo ""
echo "✅ ГОТОВО"
