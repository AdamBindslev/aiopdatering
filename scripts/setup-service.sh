#!/usr/bin/env bash
# ==============================================================================
# AI Opdatering - Headless Mac Mini Launchd Automatisering
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLIST_NAME="com.aiopdatering.syncllm.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"
LOGS_DIR="$PROJECT_DIR/logs"

# Detect node and npm paths
NODE_PATH="$(which node || echo "$HOME/.local/bin/node")"
NPM_PATH="$(which npm || echo "$HOME/.local/bin/npm")"
DIR_PATH="$(dirname "$NODE_PATH"):$(dirname "$NPM_PATH"):$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Default sync interval: 10800 seconds (3 hours). Can be changed via INTERVAL env var.
INTERVAL="${INTERVAL:-10800}"

mkdir -p "$LOGS_DIR"
mkdir -p "$HOME/Library/LaunchAgents"

case "$1" in
  install)
    echo "⚙️  Installerer macOS launchd service for AI Opdatering..."
    echo "   Projektmappe: $PROJECT_DIR"
    echo "   Node sti:    $NODE_PATH"
    echo "   Interval:    Hver $(($INTERVAL / 60)) minutter ($INTERVAL sekunder)"

    cat <<EOF > "$PLIST_DEST"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.aiopdatering.syncllm</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/zsh</string>
        <string>-c</string>
        <string>export PATH="$DIR_PATH:\$PATH" &amp;&amp; cd "$PROJECT_DIR" &amp;&amp; npm run sync:llm:auto</string>
    </array>

    <key>WorkingDirectory</key>
    <string>$PROJECT_DIR</string>

    <key>StartInterval</key>
    <integer>$INTERVAL</integer>

    <key>RunAtLoad</key>
    <true/>

    <key>StandardOutPath</key>
    <string>$LOGS_DIR/sync.log</string>

    <key>StandardErrorPath</key>
    <string>$LOGS_DIR/sync.err.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>$DIR_PATH</string>
    </dict>
</dict>
</plist>
EOF

    # Unload previous instance if running
    launchctl unload "$PLIST_DEST" 2>/dev/null || true

    # Load new plist
    launchctl load "$PLIST_DEST"
    echo "✅ Servicen er installeret og aktiveret i launchd!"
    echo "   Placering: $PLIST_DEST"
    echo "   Følg logs: tail -f \"$LOGS_DIR/sync.log\""
    ;;

  uninstall)
    echo "🛑 Afinstallerer launchd servicen..."
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
    rm -f "$PLIST_DEST"
    echo "✅ Servicen er stoppet og fjernet fra $PLIST_DEST"
    ;;

  status)
    echo "📊 Status for com.aiopdatering.syncllm:"
    launchctl list | grep "com.aiopdatering.syncllm" || echo "Servicen kører ikke i launchctl."
    echo ""
    echo "📄 Seneste linjer fra $LOGS_DIR/sync.log:"
    if [ -f "$LOGS_DIR/sync.log" ]; then
      tail -n 15 "$LOGS_DIR/sync.log"
    else
      echo "Ingen logfil fundet endnu ($LOGS_DIR/sync.log)."
    fi
    ;;

  run-now)
    echo "🚀 Kører synkronisering manuelt én gang..."
    export PATH="$DIR_PATH:$PATH"
    cd "$PROJECT_DIR"
    npm run sync:llm:auto
    ;;

  *)
    echo "Brug: ./scripts/setup-service.sh [install | uninstall | status | run-now]"
    echo ""
    echo "Eksempler:"
    echo "  ./scripts/setup-service.sh install    # Opretter og starter baggrundsservicen (kører hver time)"
    echo "  ./scripts/setup-service.sh status     # Viser status og seneste loglinjer"
    echo "  ./scripts/setup-service.sh run-now    # Kører synkroniseringen med det samme"
    echo "  ./scripts/setup-service.sh uninstall  # Stopper og fjerner baggrundsservicen"
    exit 1
    ;;
esac
