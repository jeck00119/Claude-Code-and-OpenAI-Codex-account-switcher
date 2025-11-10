# 🔄 Account Switcher for Claude Code & OpenAI Codex

<div align="center">

**Instantly switch between multiple accounts without logging out!**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-47848F?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)]()

*Save time and boost productivity by managing multiple Claude Code and OpenAI Codex accounts with a single click.*

</div>

---

## 🎯 Why Use This?

Are you tired of:
- ❌ Logging out and logging back in constantly?
- ❌ Managing multiple accounts manually?
- ❌ Wasting time on repetitive authentication?

**This app solves all that!** ✨

With Account Switcher, you can:
- ✅ **Save unlimited accounts** with custom names
- ✅ **Switch instantly** with one click
- ✅ **Backup & restore** accounts across devices
- ✅ **Auto-refresh** to see account changes in real-time
- ✅ **Beautiful modern UI** that's easy to use

---

## 🚀 Quick Start

### 📥 Installation

1. **Clone this repository**
   ```bash
   git clone https://github.com/jeck00119/Claude-Code-and-OpenAI-Codex-account-switcher.git
   cd Claude-Code-and-OpenAI-Codex-account-switcher
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Launch the app** 🎉

   **Option A: For Everyone (Recommended)**
   - Double-click `start-hidden.vbs` (no terminal window)
   - Or double-click `start.bat` (with terminal window)

   **Option B: For Developers**
   ```bash
   npm start
   ```

---

## 🎨 Features

### 🔐 Multi-Account Management
- **Save accounts** with memorable names (Work, Personal, Client A, etc.)
- **Switch instantly** between any saved account
- **Delete accounts** you no longer need

### 💾 Backup & Restore
- **Export all accounts** to a single JSON file
- **Import accounts** on a new PC without re-authenticating
- **Transfer seamlessly** between devices

### 🔄 Real-Time Updates
- **Auto-refresh** every 2 seconds to detect account changes
- **Live status** showing current active account
- **Instant feedback** when switching

### 🎯 Beautiful Interface
- **Modern gradient design** with smooth animations
- **Intuitive tabs** for Claude Code and OpenAI Codex
- **Professional UI** that's simple and clean
- **Responsive cards** with hover effects

---

## 📖 How to Use

### 1️⃣ Save Your First Account

1. Log into **Claude Code** or **OpenAI Codex** normally
2. Open the **Account Switcher** app
3. Go to the appropriate tab
4. Enter a name (e.g., "Work Account")
5. Click **Save** 💾

### 2️⃣ Add More Accounts

1. Log out from your current service
2. Log into a different account
3. Open **Account Switcher** again
4. Save the new account with a different name
5. Repeat for all your accounts!

### 3️⃣ Switch Between Accounts

1. Click on any saved account card
2. Click the **Switch** button
3. **Restart** Claude Code or OpenAI Codex
4. Done! You're now using that account 🎉

### 4️⃣ Backup Your Accounts

1. Click **Export All Accounts** button
2. Choose where to save the backup file
3. Keep it safe for restoring on other devices!

### 5️⃣ Restore Accounts on New PC

1. Install the app on your new PC
2. Click **Import Accounts** button
3. Select your backup file
4. All accounts restored instantly! ⚡

---

## 🛠️ Advanced Usage

### Building Standalone Executable

Create a distributable app:

```bash
npm run build
```

The built app will be in the `dist` folder.

### Credential File Locations

The app reads and manages these files:

| Service | File Location |
|---------|---------------|
| **Claude Code** | `~/.claude/.credentials.json`<br>`~/.claude/.claude.json` |
| **OpenAI Codex** | `~/.codex/auth.json` |

### Saved Accounts Storage

Your saved accounts are stored locally:

| Platform | Location |
|----------|----------|
| **Windows** | `%APPDATA%/account-switcher/accounts/` |
| **macOS** | `~/Library/Application Support/account-switcher/accounts/` |
| **Linux** | `~/.config/account-switcher/accounts/` |

---

## 💡 Tips & Tricks

- **Naming Convention**: Use clear names like "Work-Main", "Personal", "Client-ProjectX"
- **Regular Backups**: Export your accounts monthly to prevent data loss
- **Organize by Project**: Create accounts for different projects/clients
- **Quick Launch**: Pin `start-hidden.vbs` to your taskbar for instant access

---

## ❓ FAQ

<details>
<summary><b>Q: Is this safe? Will it steal my credentials?</b></summary>

A: Absolutely safe! This is open-source software. All account data is stored **locally on your computer** only. No data is sent anywhere. You can review the entire source code yourself.
</details>

<details>
<summary><b>Q: Do I need to restart after switching?</b></summary>

A: Yes, you must completely close and restart Claude Code or OpenAI Codex for the account change to take effect.
</details>

<details>
<summary><b>Q: Can I use this on multiple computers?</b></summary>

A: Yes! Use the Export/Import feature to transfer your saved accounts between computers.
</details>

<details>
<summary><b>Q: What if I accidentally delete an account?</b></summary>

A: If you have a backup file, you can restore it using Import. Otherwise, you'll need to log in again and save it.
</details>

<details>
<summary><b>Q: Does this work on macOS/Linux?</b></summary>

A: Yes! The app is built with Electron and works on Windows, macOS, and Linux. Just use `npm start` instead of the `.bat`/`.vbs` files.
</details>

---

## 🐛 Troubleshooting

### Account Not Switching
- ✅ Completely close and restart the service (Claude Code/Codex)
- ✅ Check that the saved account file exists
- ✅ Try switching back and forth between accounts

### No Current Account Detected
- ✅ Make sure you're logged into the service first
- ✅ Check credential files exist in the default locations
- ✅ Try logging out and back in

### Input Fields Not Working
- ✅ Close any alert dialogs completely
- ✅ Switch to another tab and back
- ✅ Restart the app

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 Fork the repository
2. 🔧 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🎉 Open a Pull Request

### Ideas for Contributions
- 🎨 UI/UX improvements
- 🌐 Internationalization (multi-language support)
- 🔔 Desktop notifications
- ⌨️ Keyboard shortcuts
- 📊 Usage statistics
- 🔍 Account search/filter

---

## 🛡️ Security

- All credentials are stored **locally** on your machine
- No data is sent to any external servers
- Backups are encrypted if you zip them with a password
- Open-source for transparency and security audits

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💖 Support

If you find this project helpful, please consider:

- ⭐ **Starring** the repository
- 🐛 **Reporting bugs** via Issues
- 💡 **Suggesting features** via Issues
- 🤝 **Contributing** code improvements
- 📢 **Sharing** with others who might find it useful

---

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Developed with the assistance of [Claude Code](https://claude.com/claude-code)
- UI inspired by modern web design principles

---

<div align="center">

**Made with ❤️ by the community**

[Report Bug](https://github.com/jeck00119/Claude-Code-and-OpenAI-Codex-account-switcher/issues) · [Request Feature](https://github.com/jeck00119/Claude-Code-and-OpenAI-Codex-account-switcher/issues)

</div>
