const { ipcRenderer } = require('electron');

// ============================================
// UNIVERSAL ALERT/CONFIRM WRAPPERS
// ============================================
// Automatically restore focus after all dialogs

async function showAlert(message, service) {
  alert(message);
  if (service) {
    await restoreFocus(service);
  }
}

async function showConfirm(message, service) {
  const result = confirm(message);
  if (service) {
    await restoreFocus(service);
  }
  return result;
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabId}-tab`).classList.add('active');
  });
});

// Save account buttons
document.getElementById('claude-save-btn').addEventListener('click', async () => {
  const name = document.getElementById('claude-save-name').value.trim();
  if (name) {
    await saveAccount('claude', name);
  } else {
    await showAlert('Please enter an account name', 'claude');
  }
});

document.getElementById('codex-save-btn').addEventListener('click', async () => {
  const name = document.getElementById('codex-save-name').value.trim();
  if (name) {
    await saveAccount('codex', name);
  } else {
    await showAlert('Please enter an account name', 'codex');
  }
});

// Export button
document.getElementById('export-btn').addEventListener('click', async () => {
  await exportAccounts();
});

// Import button
document.getElementById('import-btn').addEventListener('click', async () => {
  await importAccounts();
});

// Load current accounts
async function loadCurrentAccounts() {
  try {
    const accounts = await ipcRenderer.invoke('get-current-accounts');

    // Claude
    const claudeInfo = document.getElementById('claude-current-info');
    if (accounts.claude.exists) {
      claudeInfo.innerHTML = `
        <div class="info-row">
          <span class="label">Email:</span>
          <span class="value">${accounts.claude.email}</span>
        </div>
        <div class="info-row">
          <span class="label">Plan:</span>
          <span class="value">${accounts.claude.subscriptionType}</span>
        </div>
        <div class="info-row">
          <span class="label">Status:</span>
          <span class="status-badge">Active</span>
        </div>
      `;
    } else {
      claudeInfo.innerHTML = '<p class="empty-state">No active account found</p>';
    }

    // Codex
    const codexInfo = document.getElementById('codex-current-info');
    if (accounts.codex.exists) {
      codexInfo.innerHTML = `
        <div class="info-row">
          <span class="label">Email:</span>
          <span class="value">${accounts.codex.email}</span>
        </div>
        <div class="info-row">
          <span class="label">Plan:</span>
          <span class="value">${accounts.codex.planType}</span>
        </div>
        <div class="info-row">
          <span class="label">Status:</span>
          <span class="status-badge">Active</span>
        </div>
      `;
    } else {
      codexInfo.innerHTML = '<p class="empty-state">No active account found</p>';
    }
  } catch (error) {
    console.error('Error loading current accounts:', error);
  }
}

// Load saved accounts
async function loadSavedAccounts() {
  try {
    const accounts = await ipcRenderer.invoke('get-saved-accounts');

    // Claude accounts
    const claudeContainer = document.getElementById('claude-accounts');
    if (accounts.claude.length > 0) {
      claudeContainer.innerHTML = accounts.claude.map(name => `
        <div class="account-card">
          <h4>${name}</h4>
          <div class="actions">
            <button class="btn btn-success" onclick="switchAccount('claude', '${name}')">Switch</button>
            <button class="btn btn-danger" onclick="deleteAccount('claude', '${name}')">Delete</button>
          </div>
        </div>
      `).join('');
    } else {
      claudeContainer.innerHTML = '<div class="empty-state"><p>No saved accounts</p><p>Save your current account to get started</p></div>';
    }

    // Codex accounts
    const codexContainer = document.getElementById('codex-accounts');
    if (accounts.codex.length > 0) {
      codexContainer.innerHTML = accounts.codex.map(name => `
        <div class="account-card">
          <h4>${name}</h4>
          <div class="actions">
            <button class="btn btn-success" onclick="switchAccount('codex', '${name}')">Switch</button>
            <button class="btn btn-danger" onclick="deleteAccount('codex', '${name}')">Delete</button>
          </div>
        </div>
      `).join('');
    } else {
      codexContainer.innerHTML = '<div class="empty-state"><p>No saved accounts</p><p>Save your current account to get started</p></div>';
    }
  } catch (error) {
    console.error('Error loading saved accounts:', error);
  }
}

// Save account
async function saveAccount(service, name) {
  try {
    const result = await ipcRenderer.invoke('save-account', { service, name });

    if (result.success) {
      await showAlert(`Account "${name}" saved successfully!`, service);
      // Clear input
      document.getElementById(`${service}-save-name`).value = '';
      // Reload saved accounts
      await loadSavedAccounts();
    } else {
      await showAlert(`Error saving account: ${result.error}`, service);
    }
  } catch (error) {
    console.error('Error saving account:', error);
    await showAlert('Failed to save account', service);
  }
}

// Switch account
async function switchAccount(service, name) {
  const confirmed = await showConfirm(
    `Switch to "${name}" account for ${service === 'claude' ? 'Claude Code' : 'OpenAI Codex'}?\n\nYou'll need to restart the application for changes to take effect.`,
    service
  );

  if (!confirmed) return;

  try {
    const result = await ipcRenderer.invoke('switch-account', { service, name });

    if (result.success) {
      await showAlert(`Successfully switched to "${name}"!\n\nPlease restart ${service === 'claude' ? 'Claude Code' : 'OpenAI Codex'}.`, service);
      // Reload current accounts
      await loadCurrentAccounts();
    } else {
      await showAlert(`Error switching account: ${result.error}`, service);
    }
  } catch (error) {
    console.error('Error switching account:', error);
    await showAlert('Failed to switch account', service);
  }
}

// Delete account
async function deleteAccount(service, name) {
  const confirmed = await showConfirm(
    `Are you sure you want to delete the "${name}" account?\n\nThis cannot be undone.`,
    service
  );

  if (!confirmed) return;

  try {
    const result = await ipcRenderer.invoke('delete-account', { service, name });

    if (result.success) {
      await showAlert(`Account "${name}" deleted successfully!`, service);
      // Reload saved accounts
      await loadSavedAccounts();
    } else {
      await showAlert(`Error deleting account: ${result.error}`, service);
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    await showAlert('Failed to delete account', service);
  }
}

// ============================================
// HELPER: Restore Focus (Used by wrappers above)
// ============================================
async function restoreFocus(service) {
  // Force window focus from main process (OS-level)
  // Required workaround for Electron bug #31917 on Windows
  await ipcRenderer.invoke('force-window-focus');

  // Then focus the input field
  const inputField = document.getElementById(`${service}-save-name`);
  if (inputField) {
    setTimeout(() => {
      inputField.focus(); // Focus input
      inputField.click(); // Trigger click to ensure it's active
    }, 100);
  }
}

// Get currently active service tab
function getActiveService() {
  const claudeTab = document.getElementById('claude-tab');
  if (claudeTab && claudeTab.classList.contains('active')) {
    return 'claude';
  }
  return 'codex';
}

// Export all accounts
async function exportAccounts() {
  try {
    const service = getActiveService();
    const result = await ipcRenderer.invoke('export-accounts');

    if (result.success) {
      await showAlert(`Accounts exported successfully to:\n${result.filePath}`, service);
    } else if (result.error !== 'Export cancelled') {
      await showAlert(`Error exporting accounts: ${result.error}`, service);
    }
  } catch (error) {
    console.error('Error exporting accounts:', error);
    await showAlert('Failed to export accounts', getActiveService());
  }
}

// Import accounts
async function importAccounts() {
  try {
    const service = getActiveService();
    const result = await ipcRenderer.invoke('import-accounts');

    if (result.success) {
      await showAlert(result.message, service);
      // Reload saved accounts to show imported ones
      await loadSavedAccounts();
    } else if (result.error !== 'Import cancelled') {
      await showAlert(`Error importing accounts: ${result.error}`, service);
    }
  } catch (error) {
    console.error('Error importing accounts:', error);
    await showAlert('Failed to import accounts', getActiveService());
  }
}

// ============================================
// AUTO-REFRESH: Poll current accounts every 2 seconds
// ============================================
let previousAccounts = null;

async function pollCurrentAccounts() {
  try {
    const accounts = await ipcRenderer.invoke('get-current-accounts');

    // Check if anything changed
    if (JSON.stringify(accounts) !== JSON.stringify(previousAccounts)) {
      previousAccounts = accounts;

      // Update Claude display
      const claudeInfo = document.getElementById('claude-current-info');
      if (accounts.claude.exists) {
        claudeInfo.innerHTML = `
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">${accounts.claude.email}</span>
          </div>
          <div class="info-row">
            <span class="label">Plan:</span>
            <span class="value">${accounts.claude.subscriptionType}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="status-badge">Active</span>
          </div>
        `;
      } else {
        claudeInfo.innerHTML = '<p class="empty-state">No active account found</p>';
      }

      // Update Codex display
      const codexInfo = document.getElementById('codex-current-info');
      if (accounts.codex.exists) {
        codexInfo.innerHTML = `
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">${accounts.codex.email}</span>
          </div>
          <div class="info-row">
            <span class="label">Plan:</span>
            <span class="value">${accounts.codex.planType}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="status-badge">Active</span>
          </div>
        `;
      } else {
        codexInfo.innerHTML = '<p class="empty-state">No active account found</p>';
      }
    }
  } catch (error) {
    console.error('Error polling accounts:', error);
  }
}

// Start polling when page loads
window.addEventListener('DOMContentLoaded', () => {
  // Initial load
  loadCurrentAccounts();
  loadSavedAccounts();

  // Start polling every 2 seconds
  setInterval(pollCurrentAccounts, 2000);
});

// Make functions global for inline onclick handlers
window.switchAccount = switchAccount;
window.deleteAccount = deleteAccount;
