#!/bin/bash
# control.sh - управление режимами автоматики
# 
# Режимы:
#   ./control.sh auto    - включить автоматику
#   ./control.sh stop    - остановить полностью
#   ./control.sh status  - показать текущий режим и интервал
#   ./control.sh run     - запустить вручную (игнорирует режим)
#
# Интервалы:
#   ./control.sh interval 15   - каждые 15 минут
#   ./control.sh interval 30   - каждые 30 минут
#   ./control.sh interval 60   - каждый час
#   ./control.sh interval 120  - каждые 2 часа
#   ./control.sh interval 240  - каждые 4 часа

cd "$(dirname "$0")" || exit

MODE_FILE="./mode.txt"
SCRIPT_PATH="/Users/gork_mini/Pictures/Puppeteer/master_cycle.sh"
WEBHOOK_URL="https://gork8.ru/webhook/cr-start"

show_status() {
    MODE=$(cat "$MODE_FILE" 2>/dev/null || echo "не задан")
    CRON=$(crontab -l 2>/dev/null | grep master_cycle || echo "не настроен")
    
    echo "📊 Текущий режим: $MODE"
    echo "⏰ Cron: $CRON"
}

set_interval() {
    MINUTES=$1
    
    case "$MINUTES" in
        15)
            CRON_EXPR="*/15 * * * *"
            DESC="каждые 15 минут"
            ;;
        20)
            CRON_EXPR="*/20 * * * *"
            DESC="каждые 20 минут"
            ;;
        30)
            CRON_EXPR="*/30 * * * *"
            DESC="каждые 30 минут"
            ;;
        60)
            CRON_EXPR="0 * * * *"
            DESC="каждый час"
            ;;
        120)
            CRON_EXPR="0 */2 * * *"
            DESC="каждые 2 часа"
            ;;
        240)
            CRON_EXPR="0 */4 * * *"
            DESC="каждые 4 часа"
            ;;
        *)
            echo "❌ Неизвестный интервал: $MINUTES"
            echo "Доступные: 15, 20, 30, 60, 120, 240 (минуты)"
            exit 1
            ;;
    esac
    
    echo "$CRON_EXPR $SCRIPT_PATH" | crontab -
    echo "✅ Интервал: $DESC"
    echo "⏰ Cron: $CRON_EXPR $SCRIPT_PATH"
}

case "$1" in
    "auto")
        echo "auto" > "$MODE_FILE"
        echo "✅ Режим: AUTO (автоматика включена)"
        ;;
    "stop")
        echo "stop" > "$MODE_FILE"
        echo "🛑 Режим: STOP (автоматика выключена)"
        ;;
    "status")
        show_status
        ;;
    "interval")
        if [ -z "$2" ]; then
            echo "Использование: ./control.sh interval [15|30|60|120|240]"
            echo ""
            echo "  15  - каждые 15 минут"
            echo "  20  - каждые 20 минут"
            echo "  30  - каждые 30 минут"
            echo "  60  - каждый час"
            echo "  120 - каждые 2 часа"
            echo "  240 - каждые 4 часа"
        else
            set_interval "$2"
        fi
        ;;
    "run")
        LOCK_FILE="./cycle.lock"
        if [ -f "$LOCK_FILE" ]; then
            LOCK_PID=$(cat "$LOCK_FILE")
            if ps -p "$LOCK_PID" > /dev/null 2>&1; then
                echo "⚠️ Цикл уже запущен (PID $LOCK_PID). Подожди завершения."
                exit 1
            else
                rm -f "$LOCK_FILE"
            fi
        fi
        echo $$ > "$LOCK_FILE"
        trap "rm -f $LOCK_FILE" EXIT
        
        echo "🚀 Ручной запуск (игнорируем режим)..."
        ./run_ALL_cycle.sh
        echo "🌐 Вызываем webhook..."
        curl -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" -d '{"source": "manual", "trigger": "manual"}'
        echo ""
        echo "✅ Готово!"
        ;;
    *)
        echo "Управление автоматикой скриншотов"
        echo ""
        echo "Режимы:"
        echo "  ./control.sh auto     - включить автоматику"
        echo "  ./control.sh stop     - остановить"
        echo "  ./control.sh status   - показать режим и интервал"
        echo "  ./control.sh run      - запустить вручную"
        echo ""
        echo "Интервалы:"
        echo "  ./control.sh interval 15   - каждые 15 мин"
        echo "  ./control.sh interval 20   - каждые 20 мин"
        echo "  ./control.sh interval 30   - каждые 30 мин"
        echo "  ./control.sh interval 60   - каждый час"
        echo "  ./control.sh interval 120  - каждые 2 часа"
        echo "  ./control.sh interval 240  - каждые 4 часа"
        ;;
esac
