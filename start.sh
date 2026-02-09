#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

# If --console flag is passed, run with visible terminal output
if [ "$1" = "--console" ]; then
    run() {
        ensure_npm
        ensure_dependencies
        npm start
    }

    ensure_npm() {
        if ! command -v npm &>/dev/null; then
            echo "[ERROR] npm was not found in PATH. Please install Node.js LTS and try again."
            exit 1
        fi
    }

    ensure_dependencies() {
        if [ -x "node_modules/.bin/electron" ]; then
            return
        fi
        echo "Installing missing dependencies..."
        npm install
    }

    run
    exit 0
fi

# Default: launch hidden (no terminal window)
if [ "$(uname)" = "Darwin" ]; then
    # macOS: use open to detach from terminal
    nohup "$0" --console &>/dev/null &
else
    # Linux: use nohup + disown to detach
    nohup "$0" --console &>/dev/null &
    disown
fi
