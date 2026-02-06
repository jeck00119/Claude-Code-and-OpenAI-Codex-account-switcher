const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getCurrentAccounts: () => ipcRenderer.invoke('get-current-accounts'),
  getSavedAccounts: () => ipcRenderer.invoke('get-saved-accounts'),
  saveAccount: (service, name) => ipcRenderer.invoke('save-account', { service, name }),
  switchAccount: (service, name) => ipcRenderer.invoke('switch-account', { service, name }),
  deleteAccount: (service, name) => ipcRenderer.invoke('delete-account', { service, name }),
  forceWindowFocus: () => ipcRenderer.invoke('force-window-focus'),
  exportAccounts: () => ipcRenderer.invoke('export-accounts'),
  importAccounts: () => ipcRenderer.invoke('import-accounts'),
  getUsageStats: () => ipcRenderer.invoke('get-usage-stats')
});
