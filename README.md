# Account Switcher

A desktop application for switching between different accounts in Claude Code and OpenAI Codex without having to log out and log back in repeatedly.

## Features

- Switch between multiple Claude Code accounts
- Switch between multiple OpenAI Codex accounts
- Save current accounts with custom names
- Beautiful, modern GUI built with Electron
- Quick account switching with one click

## Quick Start (Easy Method)

**For non-technical users:**
1. Double-click `start.bat` to launch the app
   - Shows terminal window with app

**OR**

1. Double-click `start-hidden.vbs` for a cleaner experience
   - Launches app without terminal window

**For developers:**
```bash
npm start
```

### 2. Save Your Current Accounts

1. Make sure you're logged into Claude Code or OpenAI Codex
2. Open the Account Switcher app
3. Navigate to the appropriate tab (Claude Code or OpenAI Codex)
4. Enter a name for the account (e.g., "Work", "Personal", "Project A")
5. Click "Save"

### 3. Switch Between Accounts

1. Click on any saved account card
2. Click the "Switch" button
3. Restart Claude Code or OpenAI Codex
4. You'll now be using the selected account

### 4. Delete Saved Accounts

Click the "Delete" button on any saved account card to remove it from the list.

## Important Notes

- **Restart Required**: After switching accounts, you must restart Claude Code or OpenAI Codex for the changes to take effect
- **Backup**: The app automatically creates a backup of your current credentials before switching
- **Security**: All saved accounts are stored locally on your computer in the app's user data directory

## Technical Details

### Credential Locations

- **Claude Code**: `~/.claude/.credentials.json`
- **OpenAI Codex**: `~/.codex/auth.json`

### Saved Accounts Location

Saved accounts are stored in:
- Windows: `%APPDATA%/account-switcher/accounts/`
- macOS: `~/Library/Application Support/account-switcher/accounts/`
- Linux: `~/.config/account-switcher/accounts/`

## Building

To build the application as a standalone executable:

```bash
npm run build
```

## Development

- Built with Electron
- Node.js for file system operations
- Modern HTML/CSS/JS for the interface

## Troubleshooting

### Account not switching
- Make sure you've completely closed and restarted Claude Code or OpenAI Codex
- Check that the saved account file exists

### No current account detected
- Make sure you're logged into the service before trying to save
- Check that the credential files exist in the default locations

## License

MIT
