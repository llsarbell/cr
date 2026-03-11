#!/bin/bash
# master_cycle.sh - главный скрипт автоматики
# Проверяет режим, делает скриншоты, вызывает n8n webhook

cd "$(dirname "$0")" || exit

# Файл режима
MODE_FILE="./mode.txt"

# Lock файл (защита от двойного запуска)
LOCK_FILE="./cycle.lock"

# Webhook URL (продакшен)
WEBHOOK_URL="http://localhost:5678/webhook/cr-start"

# Лог файл
LOG_FILE="./cron.log"

# Функция логирования
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# === ПРОВЕРКА LOCK ===
if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE")
    if ps -p "$LOCK_PID" > /dev/null 2>&1; then
        log "⚠️ Цикл уже запущен (PID $LOCK_PID), пропускаем"
        exit 0
    else
        log "🧹 Удаляем старый lock (процесс $LOCK_PID не существует)"
        rm -f "$LOCK_FILE"
    fi
fi

# Создаём lock
echo $$ > "$LOCK_FILE"

# Удаляем lock при выходе
trap "rm -f $LOCK_FILE" EXIT

# Читаем режим (по умолчанию auto)
MODE=$(cat "$MODE_FILE" 2>/dev/null || echo "auto")
MODE=$(echo "$MODE" | tr -d '[:space:]')

log "=========================================="
log "Запуск master_cycle.sh"
log "Режим: $MODE"

# Проверяем режим
case "$MODE" in
    "auto")
        log "✅ Режим AUTO - запускаем полный цикл"
        ;;
    "stop")
        log "🛑 Режим STOP - выходим"
        exit 0
        ;;
    *)
        log "⚠️ Неизвестный режим '$MODE', используем AUTO"
        ;;
esac

# === ЭТАП 1: СКРИНШОТЫ ===
log "📸 Этап 1: Запуск скриншотов..."

./run_capture.sh >> "$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then
    log "❌ Ошибка при создании скриншотов"
    exit 1
fi

log "✅ Скриншоты готовы"

# === ЭТАП 2: ВЫЗОВ WEBHOOK ===
log "🌐 Этап 2: Вызов n8n webhook..."

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"source": "mac_mini", "trigger": "cron"}')

if [ "$RESPONSE" = "200" ]; then
    log "✅ Webhook вызван успешно (HTTP $RESPONSE)"
else
    log "⚠️ Webhook вернул HTTP $RESPONSE"
fi

log "🏁 Цикл завершён"
log "=========================================="
