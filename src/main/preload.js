const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vortex', {
  checkLauncherUpdate: () => ipcRenderer.invoke('launcher:check-update'),
  applyLauncherUpdate: (releaseInfo) => ipcRenderer.invoke('launcher:apply-update', releaseInfo),

  getLocalConfig: () => ipcRenderer.invoke('config:get-local'),
  getAuth: () => ipcRenderer.invoke('config:get-auth'),
  saveAuth: (auth) => ipcRenderer.invoke('config:save-auth', auth),

  play: (auth) => ipcRenderer.invoke('game:play', { auth }),

  onStatus: (callback) => ipcRenderer.on('game:status', (_e, data) => callback(data)),
  onLog: (callback) => ipcRenderer.on('game:log', (_e, line) => callback(line)),
  onClosed: (callback) => ipcRenderer.on('game:closed', (_e, code) => callback(code)),
  onUpdateProgress: (callback) => ipcRenderer.on('launcher:update-progress', (_e, data) => callback(data))
});
