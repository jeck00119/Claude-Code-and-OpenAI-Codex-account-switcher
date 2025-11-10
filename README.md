# 🔄 Account Switcher for Claude Code & OpenAI Codex

<div align="center">

**Instantly switch between multiple accounts without logging out!**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-47848F?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)]()

</div>

---

## 🎯 Why Use This?

Stop wasting time logging in and out! This app lets you:
- ✅ Save unlimited accounts with custom names
- ✅ Switch between accounts with one click
- ✅ Backup & restore accounts across devices
- ✅ See account changes in real-time

---

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/jeck00119/Claude-Code-and-OpenAI-Codex-account-switcher.git
   cd Claude-Code-and-OpenAI-Codex-account-switcher
   npm install
   ```

2. **Launch the app**
   - Double-click `start-hidden.vbs` (recommended)
   - Or run `npm start`

---

## 📖 How to Use

### Save an Account
1. Log into Claude Code or OpenAI Codex
2. Open Account Switcher
3. Enter a name and click "Save"

### Switch Accounts
1. Click on a saved account
2. Click "Switch"
3. Restart Claude Code/Codex

### Backup & Restore
- **Export**: Click "Export All Accounts" to save a backup file
- **Import**: Click "Import Accounts" to restore from backup

---

## 🎨 Features

- 🔐 **Multi-Account Management** - Save and organize unlimited accounts
- 💾 **Backup & Restore** - Transfer accounts between devices
- 🔄 **Real-Time Updates** - Auto-refresh every 2 seconds
- 🎯 **Beautiful UI** - Modern, professional interface

---

## ❓ FAQ

<details>
<summary><b>Is this safe?</b></summary>

Yes! All data is stored locally on your computer. This is open-source software - you can review the code yourself.
</details>

<details>
<summary><b>Do I need to restart after switching?</b></summary>

Yes, you must restart Claude Code or OpenAI Codex for the change to take effect.
</details>

<details>
<summary><b>Can I use this on multiple computers?</b></summary>

Yes! Use the Export/Import feature to transfer accounts between devices.
</details>

<details>
<summary><b>Does this work on macOS/Linux?</b></summary>

Yes! Works on Windows, macOS, and Linux.
</details>

---

## 🛠️ Building

Create a standalone executable:
```bash
npm run build
```

---

## 🐛 Troubleshooting

**Account Not Switching**
- Restart Claude Code/Codex completely
- Check that the saved account file exists

**No Current Account Detected**
- Make sure you're logged in first
- Check credential files exist in default locations

---

## 📍 File Locations

### Credentials
| Service | Location |
|---------|----------|
| **Claude Code** | `~/.claude/.credentials.json`<br>`~/.claude/.claude.json` |
| **OpenAI Codex** | `~/.codex/auth.json` |

### Saved Accounts
| Platform | Location |
|----------|----------|
| **Windows** | `%APPDATA%/account-switcher/accounts/` |
| **macOS** | `~/Library/Application Support/account-switcher/accounts/` |
| **Linux** | `~/.config/account-switcher/accounts/` |

---

## 🤝 Contributing

Contributions welcome! Fork the repo, make your changes, and submit a PR.

**Ideas:**
- UI/UX improvements
- Keyboard shortcuts
- Desktop notifications
- Multi-language support

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

[Report Bug](https://github.com/jeck00119/Claude-Code-and-OpenAI-Codex-account-switcher/issues) · [Request Feature](https://github.com/jeck00119/Claude-Code-and-OpenAI-Codex-account-switcher/issues)

⭐ Star this repo if you find it helpful!

</div>
