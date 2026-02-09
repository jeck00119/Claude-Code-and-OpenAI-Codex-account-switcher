# Account Switcher for Claude Code & OpenAI Codex

Instantly switch between multiple accounts without logging out.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-47848F?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)]()

---

## Features

- **Multi-Account Management** - Save and switch between unlimited accounts
- **Token Usage Tracking** - Live usage stats for both Claude (OAuth API) and Codex (session files)
- **Auto-Detection** - Automatically finds and identifies current logged-in accounts
- **Backup & Restore** - Export/import all accounts to transfer between devices
- **Real-Time Updates** - Polls for account changes every 5 seconds, usage every 60 seconds

---

## Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/jeck00119/Claude-Code-and-OpenAI-Codex-account-switcher.git
   cd Claude-Code-and-OpenAI-Codex-account-switcher
   npm install
   ```

2. **Launch**

   | Platform | Command |
   |----------|---------|
   | **Windows** | Double-click `start.bat` |
   | **macOS / Linux** | `./start.sh` |
   | **Any** | `npm start` |

   By default the launcher runs without a terminal window. Use `--console` to see output:
   ```bash
   # Windows
   start.bat --console

   # macOS / Linux
   ./start.sh --console
   ```

---

## How to Use

### Save an Account
1. Log into Claude Code or OpenAI Codex
2. Open Account Switcher — your current account is auto-detected
3. The email is pre-filled as the account name — click **Save**

### Switch Accounts
1. Click **Switch** on a saved account
2. Restart Claude Code or Codex for changes to take effect

### Backup & Restore
- **Export**: Click "Export All Accounts" to save a backup file
- **Import**: Click "Import Accounts" to restore from backup

---

## File Locations

### Credentials (read by the app)
| Service | Files |
|---------|-------|
| **Claude Code** | `~/.claude/.credentials.json` (auth tokens)<br>`~/.claude/.claude.json` or `~/.claude.json` (account config) |
| **OpenAI Codex** | `~/.codex/auth.json` (auth tokens)<br>`~/.codex/sessions/` (usage data) |

### Saved Accounts (managed by the app)
| Platform | Location |
|----------|----------|
| **Windows** | `%APPDATA%/account-switcher/accounts/` |
| **macOS** | `~/Library/Application Support/account-switcher/accounts/` |
| **Linux** | `~/.config/account-switcher/accounts/` |

---

## Building

Create a standalone executable:
```bash
npm run build
```

---

## Troubleshooting

**Account Not Switching**
- Restart Claude Code/Codex completely
- Check that the saved account files exist in the locations above

**No Current Account Detected**
- Make sure you're logged in to Claude Code or Codex first
- On macOS, Claude Code uses the system Keychain instead of `.credentials.json`

**Usage Stats Not Showing**
- Claude: requires a valid OAuth access token (login to Claude Code first)
- Codex: requires at least one Codex CLI session to exist in `~/.codex/sessions/`

---

## FAQ

**Is this safe?**
All data is stored locally. Credentials never leave your machine. The source is open for review.

**Does this work on macOS/Linux?**
Yes. Note that on macOS, Claude Code stores credentials in the system Keychain rather than a file, so account detection may not work there.

**Can I use this on multiple computers?**
Yes — use the Export/Import feature to transfer accounts.

---

## License

MIT
