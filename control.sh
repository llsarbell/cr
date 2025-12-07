#!/bin/bash
# control.sh - управление режимами автоматики
# Использование:
#   ./control.sh auto   - включить автоматику
#   ./control.sh pause  - поставить на паузу
#   ./control.sh stop   - остановить полностью
#   ./control.sh status - показать текущий режим
#   ./control.sh run    - запустить вручную (игнорирует режим)

cd "$(dirname "$0")" || exit

MODE_FILE="./mode.txt"
WEBHOOK_URL="https://gork8.ru/webhook/cr-start"

case "$1" in
    "auto")
        echo "auto" > "$MODE_FILE"
        echo "✅ Режим: AUTO (автоматика включена)"
        ;;
    "pause")
        echo "pause" > "$MODE_FILE"
        echo "⏸️ Режим: PAUSE (временная пауза)"
        ;;
    "stop")
        echo "stop" > "$MODE_FILE"
        echo "🛑 Режим: STOP (автоматика выключена)"
        ;;
    "status")
        MODE=$(cat "$MODE_FILE" 2>/dev/null || echo "не задан")
        echo "📊 Текущий режим: $MODE"
        ;;
    "run")
        echo "🚀 Ручной запуск (игнорируем режим)..."
        ./run_ALL_cycle.sh
        echo "🌐 Вызываем webhook..."
        curl -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" -d '{"source": "manual", "trigger": "manual"}'
        echo ""
        echo "✅ Готово!"
        ;;
    *)
        echo "Использование: ./control.sh [auto|pause|stop|status|run]"
        echo ""
        echo "  auto   - включить автоматику (cron каждый час)"
        echo "  pause  - временная пауза (cron пропускает)"
        echo "  stop   - полная остановка"
        echo "  status - показать текущий режим"
        echo "  run    - запустить вручную прямо сейчас"
        ;;
esac
