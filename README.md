# Account Switcher for Claude Code & OpenAI Codex

Instantly switch between multiple accounts without logging out. Your saved accounts are password-protected and encrypted.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-47848F?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)]()

---

## Quick Start

1. Install [Node.js](https://nodejs.org/) (LTS) if you don't have it

2. Clone and launch — dependencies install automatically:
   ```bash
   git clone https://github.com/jeck00119/Claude-Code-and-OpenAI-Codex-account-switcher.git
   cd Claude-Code-and-OpenAI-Codex-account-switcher
   ```

   | Platform | Command |
   |----------|---------|
   | **Windows** | Double-click `start.bat` |
   | **macOS / Linux** | `./start.sh` |
   | **Any** | `npm install && npm start` |

3. On first launch, create a password to protect your saved accounts

That's it! The app will auto-detect your current Claude Code or Codex account.

---

## How to Use

**Save** — Your current account is auto-detected. Click **Save** to store it.

**Switch** — Click **Switch** on any saved account, then restart Claude Code or Codex.

**Export / Import** — Transfer accounts between computers. You'll need the same password on both.

**Change Password** — In the Backup & Restore section at the bottom.

Use `--console` flag with the start script to see debug output if needed.

---

## Troubleshooting

**Account not switching?** Restart Claude Code or Codex completely after switching.

**No account detected?** Make sure you're logged in first. On macOS, Claude Code uses the system Keychain so detection may not work.

**Usage stats not showing?** Claude needs a valid login. Codex needs at least one CLI session.

**Forgot your password?** There's no recovery. Delete the app data folder to start fresh:
- Windows: `%APPDATA%/account-switcher/`
- macOS: `~/Library/Application Support/account-switcher/`
- Linux: `~/.config/account-switcher/`

---

## Building

Create a standalone executable:
```bash
npm run build
```

Supports `--win`, `--mac`, or `--linux` flags. Output goes to `dist/`.

---

## License

MIT
