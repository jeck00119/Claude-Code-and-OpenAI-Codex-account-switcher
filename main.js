const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');

const HOME_DIR = os.homedir();
const CLAUDE_CREDS = path.join(HOME_DIR, '.claude', '.credentials.json');
const CLAUDE_CONFIG_PRIMARY = path.join(HOME_DIR, '.claude', '.claude.json');
const CLAUDE_CONFIG_FALLBACK = path.join(HOME_DIR, '.claude.json');
const CODEX_AUTH = path.join(HOME_DIR, '.codex', 'auth.json');
const ACCOUNTS_DIR = path.join(app.getPath('userData'), 'accounts');

// Create accounts directory if it doesn't exist
if (!fs.existsSync(ACCOUNTS_DIR)) {
  fs.mkdirSync(ACCOUNTS_DIR, { recursive: true });
}

// Validate service parameter - must be exactly 'claude' or 'codex'
function validateService(service) {
  const ALLOWED_SERVICES = ['claude', 'codex'];
  if (!ALLOWED_SERVICES.includes(service)) {
    throw new Error(`Invalid service: ${service}`);
  }
  return service;
}

// Sanitize account name - strip anything that could cause path traversal
function sanitizeAccountName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Account name must be a non-empty string');
  }
  const sanitized = name.replace(/[^a-zA-Z0-9 _-]/g, '').trim();
  if (sanitized.length === 0) {
    throw new Error('Account name contains only invalid characters');
  }
  if (sanitized.length > 100) {
    throw new Error('Account name too long (max 100 characters)');
  }
  return sanitized;
}

// Verify a resolved path stays within the expected base directory
function ensurePathWithin(filePath, baseDir) {
  const resolved = path.resolve(filePath);
  const resolvedBase = path.resolve(baseDir);
  if (!resolved.startsWith(resolvedBase + path.sep) && resolved !== resolvedBase) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    resizable: true,
    show: true,
    focusable: true
  });

  mainWindow.loadFile('index.html');

  // Ensure window gets focus after loading
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Helper function to get Claude config path with fallback
function getClaudeConfigPath() {
  // Check primary location first
  if (fs.existsSync(CLAUDE_CONFIG_PRIMARY)) {
    try {
      const data = JSON.parse(fs.readFileSync(CLAUDE_CONFIG_PRIMARY, 'utf8'));
      // Verify it has valid oauthAccount structure
      if (data.oauthAccount) {
        return CLAUDE_CONFIG_PRIMARY;
      }
    } catch (error) {
      // Invalid JSON, try fallback
    }
  }

  // Fallback to standard location
  return CLAUDE_CONFIG_FALLBACK;
}

// Get current account info
ipcMain.handle('get-current-accounts', async () => {
  try {
    // Get Claude account info from config and credentials files
    const claudeConfigPath = getClaudeConfigPath();
    const claudeConfigData = fs.existsSync(claudeConfigPath)
      ? JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'))
      : null;

    const claudeCredsData = fs.existsSync(CLAUDE_CREDS)
      ? JSON.parse(fs.readFileSync(CLAUDE_CREDS, 'utf8'))
      : null;

    const codexData = fs.existsSync(CODEX_AUTH)
      ? JSON.parse(fs.readFileSync(CODEX_AUTH, 'utf8'))
      : null;

    return {
      claude: claudeConfigData?.oauthAccount ? {
        exists: true,
        email: claudeConfigData.oauthAccount.emailAddress || 'Unknown',
        subscriptionType: claudeCredsData?.claudeAiOauth?.subscriptionType || 'Unknown'
      } : { exists: false },
      codex: codexData ? {
        exists: true,
        email: extractEmailFromToken(codexData.tokens?.id_token) || 'Unknown',
        planType: extractPlanFromToken(codexData.tokens?.id_token) || 'Unknown'
      } : { exists: false }
    };
  } catch (error) {
    console.error('Error getting current accounts:', error);
    return { claude: { exists: false }, codex: { exists: false } };
  }
});

// Get list of saved accounts
ipcMain.handle('get-saved-accounts', async () => {
  try {
    const claudeDir = path.join(ACCOUNTS_DIR, 'claude');
    const codexDir = path.join(ACCOUNTS_DIR, 'codex');

    const claudeAccounts = fs.existsSync(claudeDir)
      ? fs.readdirSync(claudeDir).filter(f => f.endsWith('-config.json')).map(f => f.replace('-config.json', ''))
      : [];

    const codexAccounts = fs.existsSync(codexDir)
      ? fs.readdirSync(codexDir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))
      : [];

    return {
      claude: claudeAccounts,
      codex: codexAccounts
    };
  } catch (error) {
    console.error('Error getting saved accounts:', error);
    return { claude: [], codex: [] };
  }
});

// Save current account
ipcMain.handle('save-account', async (event, { service, name }) => {
  try {
    validateService(service);
    name = sanitizeAccountName(name);
    const serviceDir = path.join(ACCOUNTS_DIR, service);
    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
    }

    if (service === 'claude') {
      // For Claude, save both credentials and config files
      const claudeConfigPath = getClaudeConfigPath();

      if (!fs.existsSync(CLAUDE_CREDS)) {
        return { success: false, error: 'No active credentials found' };
      }

      if (!fs.existsSync(claudeConfigPath)) {
        return { success: false, error: 'No active config found' };
      }

      const credsDestPath = path.join(serviceDir, `${name}-credentials.json`);
      const configDestPath = path.join(serviceDir, `${name}-config.json`);

      fs.copyFileSync(CLAUDE_CREDS, credsDestPath);
      fs.copyFileSync(claudeConfigPath, configDestPath);
    } else {
      // For Codex, save auth.json only
      if (!fs.existsSync(CODEX_AUTH)) {
        return { success: false, error: 'No active account found' };
      }

      const destPath = path.join(serviceDir, `${name}.json`);
      fs.copyFileSync(CODEX_AUTH, destPath);
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving account:', error);
    return { success: false, error: error.message };
  }
});

// Switch to saved account
ipcMain.handle('switch-account', async (event, { service, name }) => {
  try {
    validateService(service);
    name = sanitizeAccountName(name);
    if (service === 'claude') {
      // For Claude, restore both credentials and config files
      const credsSourcePath = path.join(ACCOUNTS_DIR, service, `${name}-credentials.json`);
      const configSourcePath = path.join(ACCOUNTS_DIR, service, `${name}-config.json`);

      if (!fs.existsSync(credsSourcePath) || !fs.existsSync(configSourcePath)) {
        return { success: false, error: 'Saved account not found' };
      }

      const claudeConfigPath = getClaudeConfigPath();

      // Create backups of current files
      if (fs.existsSync(CLAUDE_CREDS)) {
        fs.copyFileSync(CLAUDE_CREDS, `${CLAUDE_CREDS}.backup`);
      }

      if (fs.existsSync(claudeConfigPath)) {
        fs.copyFileSync(claudeConfigPath, `${claudeConfigPath}.backup`);
      }

      // Restore saved account files
      fs.copyFileSync(credsSourcePath, CLAUDE_CREDS);
      fs.copyFileSync(configSourcePath, claudeConfigPath);
    } else {
      // For Codex, restore auth.json only
      const sourcePath = path.join(ACCOUNTS_DIR, service, `${name}.json`);

      if (!fs.existsSync(sourcePath)) {
        return { success: false, error: 'Saved account not found' };
      }

      // Create backup of current account
      if (fs.existsSync(CODEX_AUTH)) {
        fs.copyFileSync(CODEX_AUTH, `${CODEX_AUTH}.backup`);
      }

      // Restore saved account
      fs.copyFileSync(sourcePath, CODEX_AUTH);
    }

    return { success: true };
  } catch (error) {
    console.error('Error switching account:', error);
    return { success: false, error: error.message };
  }
});

// Delete saved account
ipcMain.handle('delete-account', async (event, { service, name }) => {
  try {
    validateService(service);
    name = sanitizeAccountName(name);
    if (service === 'claude') {
      // For Claude, delete both credentials and config files
      const credsPath = path.join(ACCOUNTS_DIR, service, `${name}-credentials.json`);
      const configPath = path.join(ACCOUNTS_DIR, service, `${name}-config.json`);

      let deleted = false;

      if (fs.existsSync(credsPath)) {
        fs.unlinkSync(credsPath);
        deleted = true;
      }

      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
        deleted = true;
      }

      if (deleted) {
        return { success: true };
      }

      return { success: false, error: 'Account not found' };
    } else {
      // For Codex, delete auth.json only
      const filePath = path.join(ACCOUNTS_DIR, service, `${name}.json`);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true };
      }

      return { success: false, error: 'Account not found' };
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: error.message };
  }
});

// Force window focus (for restoring focus after alerts)
// Uses blur() then focus() workaround for Electron bug #31917
ipcMain.handle('force-window-focus', async () => {
  if (mainWindow) {
    mainWindow.blur();   // First blur to reset Windows focus state
    mainWindow.focus();  // Then focus to restore
    return { success: true };
  }
  return { success: false };
});

// Export all saved accounts
ipcMain.handle('export-accounts', async () => {
  try {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      claude: {},
      codex: {}
    };

    const claudeDir = path.join(ACCOUNTS_DIR, 'claude');
    const codexDir = path.join(ACCOUNTS_DIR, 'codex');

    // Export Claude accounts
    if (fs.existsSync(claudeDir)) {
      const files = fs.readdirSync(claudeDir);
      const accounts = {};

      files.forEach(file => {
        if (file.endsWith('-config.json')) {
          const name = file.replace('-config.json', '');
          const credentialsFile = `${name}-credentials.json`;

          if (fs.existsSync(path.join(claudeDir, credentialsFile))) {
            accounts[name] = {
              credentials: JSON.parse(fs.readFileSync(path.join(claudeDir, credentialsFile), 'utf8')),
              config: JSON.parse(fs.readFileSync(path.join(claudeDir, file), 'utf8'))
            };
          }
        }
      });

      exportData.claude = accounts;
    }

    // Export Codex accounts
    if (fs.existsSync(codexDir)) {
      const files = fs.readdirSync(codexDir);
      const accounts = {};

      files.forEach(file => {
        if (file.endsWith('.json')) {
          const name = file.replace('.json', '');
          accounts[name] = {
            auth: JSON.parse(fs.readFileSync(path.join(codexDir, file), 'utf8'))
          };
        }
      });

      exportData.codex = accounts;
    }

    // Show save dialog
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Accounts',
      defaultPath: `accounts-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2), 'utf8');
      return { success: true, filePath: result.filePath };
    }

    return { success: false, error: 'Export cancelled' };
  } catch (error) {
    console.error('Error exporting accounts:', error);
    return { success: false, error: error.message };
  }
});

// Import saved accounts
ipcMain.handle('import-accounts', async () => {
  try {
    // Show open dialog
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Accounts',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { success: false, error: 'Import cancelled' };
    }

    const filePath = result.filePaths[0];
    const importData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Validate structure
    if (!importData.version || !importData.claude || !importData.codex) {
      return { success: false, error: 'Invalid backup file format' };
    }

    let imported = { claude: 0, codex: 0 };

    // Import Claude accounts
    const claudeDir = path.join(ACCOUNTS_DIR, 'claude');
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
    }

    for (const [rawName, data] of Object.entries(importData.claude)) {
      const name = sanitizeAccountName(rawName);
      const credsPath = path.join(claudeDir, `${name}-credentials.json`);
      const configPath = path.join(claudeDir, `${name}-config.json`);
      ensurePathWithin(credsPath, claudeDir);
      ensurePathWithin(configPath, claudeDir);

      fs.writeFileSync(credsPath, JSON.stringify(data.credentials, null, 2), 'utf8');
      fs.writeFileSync(configPath, JSON.stringify(data.config, null, 2), 'utf8');
      imported.claude++;
    }

    // Import Codex accounts
    const codexDir = path.join(ACCOUNTS_DIR, 'codex');
    if (!fs.existsSync(codexDir)) {
      fs.mkdirSync(codexDir, { recursive: true });
    }

    for (const [rawName, data] of Object.entries(importData.codex)) {
      const name = sanitizeAccountName(rawName);
      const authPath = path.join(codexDir, `${name}.json`);
      ensurePathWithin(authPath, codexDir);
      fs.writeFileSync(authPath, JSON.stringify(data.auth, null, 2), 'utf8');
      imported.codex++;
    }

    return {
      success: true,
      imported,
      message: `Imported ${imported.claude} Claude and ${imported.codex} Codex accounts`
    };
  } catch (error) {
    console.error('Error importing accounts:', error);
    return { success: false, error: error.message };
  }
});

// Helper function to extract email from JWT token
function extractEmailFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return decoded.email || null;
  } catch (error) {
    return null;
  }
}

// Helper function to extract plan type from JWT token
function extractPlanFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return decoded['https://api.openai.com/auth']?.chatgpt_plan_type || null;
  } catch (error) {
    return null;
  }
}

// ============================================
// USAGE TRACKING FUNCTIONS
// ============================================

// Fetch Claude usage from OAuth API
async function fetchClaudeUsageFromAPI() {
  try {
    if (!fs.existsSync(CLAUDE_CREDS)) {
      return null;
    }

    const credsData = JSON.parse(fs.readFileSync(CLAUDE_CREDS, 'utf8'));
    const accessToken = credsData.claudeAiOauth?.accessToken;

    if (!accessToken) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/api/oauth/usage',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'anthropic-beta': 'oauth-2025-04-20'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(data);
              console.log('OAuth API Response:', parsed);
              resolve(parsed);
            } catch (error) {
              console.error('Error parsing OAuth response:', error);
              resolve(null);
            }
          } else {
            console.error('OAuth API error, status:', res.statusCode, 'body:', data);
            resolve(null);
          }
        });
      });

      req.on('error', (error) => {
        resolve(null);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve(null);
      });

      req.end();
    });
  } catch (error) {
    return null;
  }
}

// Get Claude usage stats (LIVE API ONLY - no fallbacks)
async function getClaudeUsageStats() {
  // Only use OAuth API - live and fresh data
  const apiUsage = await fetchClaudeUsageFromAPI();
  if (!apiUsage || !apiUsage.five_hour || !apiUsage.seven_day) {
    return null; // No fallback - return null if API fails
  }

  // Get subscription type to determine limits
  let subscriptionType = 'pro'; // default
  const limits = {
    pro: { fiveHour: 44000, sevenDay: 308000 },
    max5: { fiveHour: 88000, sevenDay: 616000 },
    max: { fiveHour: 88000, sevenDay: 616000 }, // max5 alias
    max20: { fiveHour: 220000, sevenDay: 1540000 }
  };

  if (fs.existsSync(CLAUDE_CREDS)) {
    try {
      const credsData = JSON.parse(fs.readFileSync(CLAUDE_CREDS, 'utf8'));
      const subType = (credsData.claudeAiOauth?.subscriptionType || 'pro').toLowerCase();
      if (limits[subType]) {
        subscriptionType = subType;
      } else if (subType.includes('max')) {
        subscriptionType = subType.includes('20') ? 'max20' : 'max';
      }
    } catch (error) {
      // Use default
    }
  }

  const limit = limits[subscriptionType];

  // API returns utilization as percentage (e.g., 7.0 = 7%)
  const fiveHourUsed = Math.round((apiUsage.five_hour.utilization / 100) * limit.fiveHour);
  const sevenDayUsed = Math.round((apiUsage.seven_day.utilization / 100) * limit.sevenDay);

  return {
    five_hour: {
      used: fiveHourUsed,
      limit: limit.fiveHour,
      remaining: limit.fiveHour - fiveHourUsed,
      percentage: apiUsage.five_hour.utilization,
      resets_at: apiUsage.five_hour.resets_at
    },
    seven_day: {
      used: sevenDayUsed,
      limit: limit.sevenDay,
      remaining: limit.sevenDay - sevenDayUsed,
      percentage: apiUsage.seven_day.utilization,
      resets_at: apiUsage.seven_day.resets_at
    },
    subscription_type: subscriptionType,
    source: 'live_api'
  };
}

// Read Codex usage from most recent session file
function getCodexUsageFromSessions() {
  try {
    const sessionsDir = path.join(HOME_DIR, '.codex', 'sessions');
    if (!fs.existsSync(sessionsDir)) {
      return null;
    }

    // Find all session JSONL files
    function findSessionFiles(dir, files = []) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findSessionFiles(fullPath, files);
        } else if (item.endsWith('.jsonl')) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const sessionFiles = findSessionFiles(sessionsDir);
    if (sessionFiles.length === 0) {
      return null;
    }

    // Sort by modification time, most recent first
    sessionFiles.sort((a, b) => {
      const statsA = fs.statSync(a);
      const statsB = fs.statSync(b);
      return statsB.mtime - statsA.mtime;
    });

    // Read the most recent session file line by line from the end
    const mostRecentFile = sessionFiles[0];
    const content = fs.readFileSync(mostRecentFile, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    // Parse lines in reverse to find the most recent rate_limits
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const line = JSON.parse(lines[i]);
        if (line.payload && line.payload.rate_limits) {
          return line.payload.rate_limits;
        }
      } catch (e) {
        // Skip invalid JSON lines
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error reading Codex sessions:', error);
    return null;
  }
}

// Get Codex usage stats from session files
async function getCodexUsageStats() {
  try {
    if (!fs.existsSync(CODEX_AUTH)) {
      return null;
    }

    // Get plan type from JWT
    let jwtPlanType = 'unknown';
    try {
      const authData = JSON.parse(fs.readFileSync(CODEX_AUTH, 'utf8'));
      const idToken = authData.tokens?.id_token;
      if (idToken) {
        const payload = idToken.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
        jwtPlanType = decoded['https://api.openai.com/auth']?.chatgpt_plan_type || 'unknown';
      }
    } catch (error) {
      // Continue with unknown plan
    }

    // Read from most recent Codex session file
    const rateLimits = getCodexUsageFromSessions();

    if (!rateLimits || !rateLimits.primary || !rateLimits.secondary) {
      return {
        available: false,
        message: 'No recent Codex usage data found. Please use Codex CLI to generate usage data.',
        planType: jwtPlanType,
        dashboardUrl: 'https://chatgpt.com/settings'
      };
    }

    // Convert Unix timestamps to ISO strings
    const primaryResetAt = rateLimits.primary.resets_at ?
      new Date(rateLimits.primary.resets_at * 1000).toISOString() : null;

    const secondaryResetAt = rateLimits.secondary.resets_at ?
      new Date(rateLimits.secondary.resets_at * 1000).toISOString() : null;

    return {
      available: true,
      primary: {
        used_percent: rateLimits.primary.used_percent,
        remaining_percent: 100 - rateLimits.primary.used_percent,
        percentage: rateLimits.primary.used_percent,
        window_minutes: rateLimits.primary.window_minutes,
        resets_at: primaryResetAt
      },
      secondary: {
        used_percent: rateLimits.secondary.used_percent,
        remaining_percent: 100 - rateLimits.secondary.used_percent,
        percentage: rateLimits.secondary.used_percent,
        window_minutes: rateLimits.secondary.window_minutes,
        resets_at: secondaryResetAt
      },
      planType: jwtPlanType,
      source: 'codex_session_files'
    };
  } catch (error) {
    console.error('Error getting Codex usage:', error);
    return null;
  }
}

// IPC handler for getting usage stats
ipcMain.handle('get-usage-stats', async () => {
  try {
    const claudeUsage = await getClaudeUsageStats();
    const codexUsage = await getCodexUsageStats();

    return {
      claude: claudeUsage,
      codex: codexUsage
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return {
      claude: null,
      codex: null
    };
  }
});
