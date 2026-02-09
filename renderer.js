// ============================================
// SECURITY: HTML escaping utility
// ============================================
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

// ============================================
// SHARED: Render current account display
// ============================================
function renderCurrentAccounts(accounts) {
  // Claude
  const claudeInfo = document.getElementById('claude-current-info');
  if (accounts.claude.exists) {
    claudeInfo.innerHTML = `
      <div class="info-row">
        <span class="label">Email:</span>
        <span class="value">${escapeHtml(accounts.claude.email)}</span>
      </div>
      <div class="info-row">
        <span class="label">Plan:</span>
        <span class="value">${escapeHtml(accounts.claude.subscriptionType)}</span>
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
        <span class="value">${escapeHtml(accounts.codex.email)}</span>
      </div>
      <div class="info-row">
        <span class="label">Plan:</span>
        <span class="value">${escapeHtml(accounts.codex.planType)}</span>
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

// Auto-fill save input with detected email (only if user hasn't typed something)
function autoFillSaveName(service, email) {
  const input = document.getElementById(`${service}-save-name`);
  if (!input || !email || email === 'Unknown') return;
  // Only auto-fill if empty or was previously auto-filled
  if (input.value === '' || input.dataset.autoFilled === 'true') {
    input.value = email;
    input.dataset.autoFilled = 'true';
  }
}

// Clear auto-fill flag when user types manually
document.getElementById('claude-save-name').addEventListener('input', (e) => {
  e.target.dataset.autoFilled = 'false';
});
document.getElementById('codex-save-name').addEventListener('input', (e) => {
  e.target.dataset.autoFilled = 'false';
});

// Load current accounts
async function loadCurrentAccounts() {
  try {
    const accounts = await window.api.getCurrentAccounts();
    renderCurrentAccounts(accounts);

    // Auto-fill save names with detected emails
    if (accounts.claude.exists) {
      autoFillSaveName('claude', accounts.claude.email);
    }
    if (accounts.codex.exists) {
      autoFillSaveName('codex', accounts.codex.email);
    }
  } catch (error) {
    console.error('Error loading current accounts:', error);
  }
}

// Load saved accounts
async function loadSavedAccounts() {
  try {
    const accounts = await window.api.getSavedAccounts();

    // Claude accounts
    const claudeContainer = document.getElementById('claude-accounts');
    if (accounts.claude.length > 0) {
      claudeContainer.innerHTML = accounts.claude.map(name => `
        <div class="account-card">
          <h4>${escapeHtml(name)}</h4>
          <div class="actions">
            <button class="btn btn-success" data-action="switch" data-service="claude" data-name="${escapeHtml(name)}">Switch</button>
            <button class="btn btn-danger" data-action="delete" data-service="claude" data-name="${escapeHtml(name)}">Delete</button>
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
          <h4>${escapeHtml(name)}</h4>
          <div class="actions">
            <button class="btn btn-success" data-action="switch" data-service="codex" data-name="${escapeHtml(name)}">Switch</button>
            <button class="btn btn-danger" data-action="delete" data-service="codex" data-name="${escapeHtml(name)}">Delete</button>
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
    const result = await window.api.saveAccount(service, name);

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
    const result = await window.api.switchAccount(service, name);

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
    const result = await window.api.deleteAccount(service, name);

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
  await window.api.forceWindowFocus();

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
    const result = await window.api.exportAccounts();

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
    const result = await window.api.importAccounts();

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
// AUTO-REFRESH: Poll current accounts
// ============================================
let previousAccounts = null;

async function pollCurrentAccounts() {
  try {
    const accounts = await window.api.getCurrentAccounts();

    // Check if anything changed
    if (JSON.stringify(accounts) !== JSON.stringify(previousAccounts)) {
      previousAccounts = accounts;
      renderCurrentAccounts(accounts);
    }
  } catch (error) {
    console.error('Error polling accounts:', error);
  }
}

// ============================================
// EVENT DELEGATION: Handle clicks on dynamic elements
// ============================================
function setupEventDelegation() {
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const service = btn.dataset.service;
    const name = btn.dataset.name;

    if (action === 'switch') {
      switchAccount(service, name);
    } else if (action === 'delete') {
      deleteAccount(service, name);
    } else if (action === 'toggle-usage') {
      toggleUsageStats(service);
    }
  });
}

// Start polling when page loads
window.addEventListener('DOMContentLoaded', () => {
  // Set up event delegation for dynamic buttons
  setupEventDelegation();

  // Initial load
  loadCurrentAccounts();
  loadSavedAccounts();
  loadUsageStats();

  // Poll local file changes every 5 seconds
  setInterval(pollCurrentAccounts, 5000);
  // Poll API usage stats every 60 seconds
  setInterval(loadUsageStats, 60000);
});

// ============================================
// USAGE STATS FUNCTIONS
// ============================================

// Toggle usage stats visibility
function toggleUsageStats(service) {
  const content = document.getElementById(`${service}-usage-content`);
  const btn = document.querySelector(`#${service}-usage-stats .collapse-btn`);

  if (content.classList.contains('collapsed')) {
    content.classList.remove('collapsed');
    btn.textContent = '\u25BC';
  } else {
    content.classList.add('collapsed');
    btn.textContent = '\u25B6';
  }
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Calculate percentage
function calculatePercentage(used, limit) {
  if (limit === 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

// Get color based on percentage
function getUsageColor(percentage) {
  if (percentage >= 90) return '#ef4444'; // red
  if (percentage >= 70) return '#f59e0b'; // orange
  return '#10b981'; // green
}

// Format reset time
function formatResetTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date - now;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    return `Resets in ${days}d ${diffHours % 24}h`;
  } else if (diffHours > 0) {
    return `Resets in ${diffHours}h ${diffMins % 60}m`;
  } else if (diffMins > 0) {
    return `Resets in ${diffMins}m`;
  } else {
    return 'Resets soon';
  }
}

// Load and display usage stats
async function loadUsageStats() {
  try {
    const usage = await window.api.getUsageStats();

    // Claude usage
    const claudeContent = document.getElementById('claude-usage-content');
    if (usage.claude) {
      if (usage.claude.five_hour && usage.claude.seven_day) {
        const fiveHourPercent = calculatePercentage(usage.claude.five_hour.used, usage.claude.five_hour.limit);
        const sevenDayPercent = calculatePercentage(usage.claude.seven_day.used, usage.claude.seven_day.limit);

        const fiveHourReset = usage.claude.five_hour.resets_at ? formatResetTime(usage.claude.five_hour.resets_at) : '';
        const sevenDayReset = usage.claude.seven_day.resets_at ? formatResetTime(usage.claude.seven_day.resets_at) : '';

        claudeContent.innerHTML = `
          <div class="usage-period">
            <div class="period-header">
              <span class="period-title">5-Hour Window ${fiveHourReset ? `<span class="reset-time">(${fiveHourReset})</span>` : ''}</span>
              <span class="usage-numbers">${formatNumber(usage.claude.five_hour.used)} / ${formatNumber(usage.claude.five_hour.limit)} tokens</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${fiveHourPercent}%; background-color: ${getUsageColor(fiveHourPercent)}"></div>
            </div>
            <div class="usage-details">
              <span>Remaining: ${formatNumber(usage.claude.five_hour.remaining)} tokens</span>
              <span>${fiveHourPercent.toFixed(1)}% used</span>
            </div>
          </div>

          <div class="usage-period">
            <div class="period-header">
              <span class="period-title">7-Day Window ${sevenDayReset ? `<span class="reset-time">(${sevenDayReset})</span>` : ''}</span>
              <span class="usage-numbers">${formatNumber(usage.claude.seven_day.used)} / ${formatNumber(usage.claude.seven_day.limit)} tokens</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${sevenDayPercent}%; background-color: ${getUsageColor(sevenDayPercent)}"></div>
            </div>
            <div class="usage-details">
              <span>Remaining: ${formatNumber(usage.claude.seven_day.remaining)} tokens</span>
              <span>${sevenDayPercent.toFixed(1)}% used</span>
            </div>
          </div>

          <div class="usage-source">
            <small>Source: Live OAuth API ${escapeHtml('\u2713')}${usage.claude.subscription_type ? ' \u2022 Plan: ' + escapeHtml(usage.claude.subscription_type.toUpperCase()) : ''}</small>
          </div>
        `;
      } else {
        claudeContent.innerHTML = '<p class="empty-state">Usage data not available</p>';
      }
    } else {
      claudeContent.innerHTML = '<p class="empty-state">No active account</p>';
    }

    // Codex usage
    const codexContent = document.getElementById('codex-usage-content');
    if (usage.codex) {
      if (usage.codex.available === true && usage.codex.primary && usage.codex.secondary) {
        // Codex uses percentage-based limits, not absolute token counts
        const primaryPercent = usage.codex.primary.percentage || usage.codex.primary.used_percent || 0;
        const secondaryPercent = usage.codex.secondary.percentage || usage.codex.secondary.used_percent || 0;

        const primaryReset = usage.codex.primary.resets_at ? formatResetTime(usage.codex.primary.resets_at) : '';
        const secondaryReset = usage.codex.secondary.resets_at ? formatResetTime(usage.codex.secondary.resets_at) : '';

        // Format window names based on minutes
        const primaryWindow = usage.codex.primary.window_minutes > 0 ?
          `${Math.floor(usage.codex.primary.window_minutes / 60)}-Hour` : 'Primary';
        const secondaryWindow = usage.codex.secondary.window_minutes > 0 ?
          (usage.codex.secondary.window_minutes >= 1440 ?
            `${Math.floor(usage.codex.secondary.window_minutes / 1440)}-Day` :
            `${Math.floor(usage.codex.secondary.window_minutes / 60)}-Hour`) : 'Secondary';

        codexContent.innerHTML = `
          <div class="usage-period">
            <div class="period-header">
              <span class="period-title">${primaryWindow} Window ${primaryReset ? `<span class="reset-time">(${primaryReset})</span>` : ''}</span>
              <span class="usage-numbers">${primaryPercent.toFixed(1)}% used</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${primaryPercent}%; background-color: ${getUsageColor(primaryPercent)}"></div>
            </div>
            <div class="usage-details">
              <span>Remaining: ${(100 - primaryPercent).toFixed(1)}%</span>
              <span>${primaryPercent.toFixed(1)}% used</span>
            </div>
          </div>

          <div class="usage-period">
            <div class="period-header">
              <span class="period-title">${secondaryWindow} Window ${secondaryReset ? `<span class="reset-time">(${secondaryReset})</span>` : ''}</span>
              <span class="usage-numbers">${secondaryPercent.toFixed(1)}% used</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${secondaryPercent}%; background-color: ${getUsageColor(secondaryPercent)}"></div>
            </div>
            <div class="usage-details">
              <span>Remaining: ${(100 - secondaryPercent).toFixed(1)}%</span>
              <span>${secondaryPercent.toFixed(1)}% used</span>
            </div>
          </div>

          <div class="usage-source">
            <small>Source: Codex Session Files ${escapeHtml('\u2713')}${usage.codex.planType ? ' \u2022 Plan: ' + escapeHtml(usage.codex.planType.toUpperCase()) : ''}</small>
          </div>
        `;
      } else if (usage.codex.available === false) {
        codexContent.innerHTML = `
          <div class="usage-unavailable">
            <p>${escapeHtml(usage.codex.message)}</p>
            ${usage.codex.planType ? `<p><small>Plan: ${escapeHtml(usage.codex.planType.toUpperCase())}</small></p>` : ''}
            <a href="https://chatgpt.com/settings" target="_blank" class="dashboard-link">View Usage Dashboard</a>
          </div>
        `;
      } else {
        codexContent.innerHTML = '<p class="empty-state">Usage data not available</p>';
      }
    } else {
      codexContent.innerHTML = '<p class="empty-state">No active account</p>';
    }
  } catch (error) {
    console.error('Error loading usage stats:', error);
  }
}
