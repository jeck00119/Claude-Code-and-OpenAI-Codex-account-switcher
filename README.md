# Account Switcher for Claude Code & OpenAI Codex

Instantly switch between multiple accounts without logging out.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-47848F?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)]()

---

## Features

- **Multi-Account Management** - Save and switch between unlimited accounts
- **Encrypted Storage** - Saved accounts are AES-256-GCM encrypted with a password you set on first launch
- **Token Usage Tracking** - Live usage stats for both Claude (OAuth API) and Codex (session files)
- **Auto-Detection** - Automatically finds and identifies current logged-in accounts
- **Backup & Restore** - Export/import all accounts to transfer between devices
- **Real-Time Updates** - Polls for account changes every 5 seconds, usage every 60 seconds

---

## Quick Start

1. **Prerequisites**: [Node.js](https://nodejs.org/) (LTS) must be installed

2. **Clone and launch** — dependencies install automatically on first run
   ```bash
   git clone https://github.com/jeck00119/Claude-Code-and-OpenAI-Codex-account-switcher.git
   cd Claude-Code-and-OpenAI-Codex-account-switcher
   ```

   | Platform | Command |
   |----------|---------|
   | **Windows** | Double-click `start.bat` |
   | **macOS / Linux** | `./start.sh` |
   | **Any** | `npm install && npm start` |

   By default the launcher runs without a terminal window. Use `--console` to see output:
   ```bash
   # Windows
   start.bat --console

   # macOS / Linux
   ./start.sh --console
   ```

3. **Set a password** — on first launch you'll be asked to create a password. This encrypts all saved account data on disk.

---

## How to Use

### First Launch
1. Launch the app — a password setup screen appears
2. Create a password (minimum 4 characters) — this encrypts all saved accounts
3. On every subsequent launch, enter your password to unlock

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
- Exported files keep their encryption — you need the same password to import

### Change Password
- Click "Change Password" in the Backup & Restore section
- All saved accounts are re-encrypted with the new password

---

## Security

- **AES-256-GCM** encryption for all saved account files
- **PBKDF2-SHA512** (100,000 iterations) for password key derivation
- Per-file random salt and IV — no key reuse
- Password is never stored — only a PBKDF2 hash for verification
- Content Security Policy restricts script execution
- Context isolation and disabled Node integration in the renderer

Saved account files on disk look like:
```json
{"encrypted":true,"version":1,"salt":"...","iv":"...","authTag":"...","ciphertext":"..."}
```

---

## File Locations

### Credentials (read by the app)
| Service | Files |
|---------|-------|
| **Claude Code** | `~/.claude/.credentials.json` (auth tokens)<br>`~/.claude/.claude.json` or `~/.claude.json` (account config) |
| **OpenAI Codex** | `~/.codex/auth.json` (auth tokens)<br>`~/.codex/sessions/` (usage data) |

### Saved Accounts (managed by the app, encrypted)
| Platform | Location |
|----------|----------|
| **Windows** | `%APPDATA%/account-switcher/accounts/` |
| **macOS** | `~/Library/Application Support/account-switcher/accounts/` |
| **Linux** | `~/.config/account-switcher/accounts/` |

---

## Project Structure

```
├── src/
│   ├── main.js        # Electron main process, encryption, IPC handlers
│   ├── preload.js     # IPC bridge (contextBridge)
│   ├── renderer.js    # UI logic, password gate
│   ├── index.html     # Layout and modals
│   └── styles.css     # Styles
├── start.bat          # Windows launcher
├── start.sh           # macOS/Linux launcher
├── package.json
└── README.md
```

---

## Building

Create a standalone executable:
```bash
# Build for current platform
npm run build

# Build for a specific platform
npx electron-builder --win
npx electron-builder --mac
npx electron-builder --linux
```

Output goes to the `dist/` directory.

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

**Forgot Password**
- There is no password recovery — the encryption is one-way
- Delete the password file and saved accounts to start fresh:
  - Windows: `%APPDATA%/account-switcher/password.json` and `accounts/` folder
  - macOS: `~/Library/Application Support/account-switcher/`
  - Linux: `~/.config/account-switcher/`

---

## FAQ

**Is this safe?**
All data is stored locally and encrypted with AES-256-GCM. Your password never leaves your machine. Credentials are only decrypted in memory when switching accounts. The source is open for review.

**Does this work on macOS/Linux?**
Yes. Note that on macOS, Claude Code stores credentials in the system Keychain rather than a file, so account detection may not work there.

**Can I use this on multiple computers?**
Yes — use the Export/Import feature to transfer accounts. You'll need the same password on both machines.

---

## License

MIT
